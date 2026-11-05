/** Privacy-conscious page-view tracking and the admin dashboard statistics. */
import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { pagination, q } from "../utils/http.js";
import { toApi } from "../utils/serialize.js";
import { schemas } from "../validators/index.js";

const DAY = 864e5;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

export async function track(req: Request, res: Response) {
  if (req.get("dnt") === "1" || req.get("sec-gpc") === "1") return res.status(204).end();
  const parsed = schemas.track.safeParse(req.body);
  if (!parsed.success) return res.status(204).end();
  const settings = await prisma.settings.findUnique({ where: { id: "settings" }, select: { analyticsEnabled: true } });
  if (settings?.analyticsEnabled === false) return res.status(204).end();

  const path = parsed.data.path.split("?")[0].slice(0, 300);
  if (path.startsWith("/admin")) return res.status(204).end();
  let referrerHost: string | undefined;
  try {
    referrerHost = parsed.data.referrer ? new URL(parsed.data.referrer).hostname : undefined;
  } catch { /* ignore malformed referrer */ }
  // No IP, cookie or user agent is stored; only an approximate country from the CDN, when available.
  const country = (req.get("cf-ipcountry") || req.get("x-vercel-ip-country") || "").slice(0, 2).toUpperCase() || undefined;
  await prisma.pageView.create({ data: { path, referrerHost, country, day: isoDay(new Date()) } });

  const m = path.match(/^\/(journalism|blog|projects)\/([a-z0-9-]+)$/);
  if (m) {
    if (m[1] === "projects") await prisma.project.updateMany({ where: { slug: m[2] }, data: { views: { increment: 1 } } });
    else await prisma.article.updateMany({ where: { section: m[1], slug: m[2] }, data: { views: { increment: 1 } } });
  }
  res.status(204).end();
}

export async function overview(_req: Request, res: Response) {
  const since = isoDay(new Date(Date.now() - 30 * DAY));
  const [
    totalArticles, publishedArticles, draftArticles, reviewArticles, totalProjects, totalBooks, totalVentures, totalEvents, totalResearch,
    subscribers, messages, newMessages, pendingComments, visits30, recentActivity,
  ] = await Promise.all([
    prisma.article.count(), prisma.article.count({ where: { status: "published" } }), prisma.article.count({ where: { status: "draft" } }),
    prisma.article.count({ where: { status: "in_review" } }), prisma.project.count(), prisma.book.count(), prisma.venture.count(),
    prisma.event.count(), prisma.research.count(), prisma.subscriber.count({ where: { status: "active" } }), prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { status: "new" } }), prisma.comment.count({ where: { status: "pending" } }), prisma.pageView.count({ where: { day: { gte: since } } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 12, include: { user: { select: { id: true, name: true } } } }),
  ]);
  res.json({
    counts: {
      totalArticles, publishedArticles, draftArticles, reviewArticles, totalProjects, totalBooks, totalVentures, totalEvents, totalResearch,
      subscribers, messages, newMessages, pendingComments, visits30,
    },
    recentActivity: toApi(recentActivity),
  });
}

export async function analytics(req: Request, res: Response) {
  const days = Math.min(365, Math.max(7, Number(q(req, "days") ?? 30) || 30));
  const sinceDate = new Date(Date.now() - (days - 1) * DAY);
  const perDay = async (model: any) => {
    const records = await model.findMany({ where: { createdAt: { gte: sinceDate } }, select: { createdAt: true } });
    const counts = new Map<string, number>();
    for (const record of records) {
      const day = isoDay(record.createdAt);
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    return [...counts].map(([day, count]) => ({ day, count })).sort((a, b) => a.day.localeCompare(b.day));
  };
  const pageWhere = { day: { gte: isoDay(sinceDate) } };
  const [byDay, topPaths, referrers, countries, topArticles, topProjects, subsByDay, messagesByDay] = await Promise.all([
    prisma.pageView.groupBy({ by: ["day"], where: pageWhere, _count: { _all: true }, orderBy: { day: "asc" } }),
    prisma.pageView.groupBy({ by: ["path"], where: pageWhere, _count: { _all: true }, orderBy: { _count: { path: "desc" } }, take: 10 }),
    prisma.pageView.groupBy({ by: ["referrerHost"], where: pageWhere, _count: { _all: true }, orderBy: { _count: { referrerHost: "desc" } }, take: 10 }),
    prisma.pageView.groupBy({ by: ["country"], where: pageWhere, _count: { _all: true }, orderBy: { _count: { country: "desc" } }, take: 10 }),
    prisma.article.findMany({ orderBy: { views: "desc" }, take: 5, select: { id: true, title: true, slug: true, section: true, views: true } }),
    prisma.project.findMany({ orderBy: { views: "desc" }, take: 5, select: { id: true, title: true, slug: true, views: true } }),
    perDay(prisma.subscriber), perDay(prisma.contactMessage),
  ]);
  // Fill missing days with zero so the chart has a continuous axis.
  const viewMap = new Map(byDay.map((d) => [d.day, d._count._all]));
  const series = Array.from({ length: days }, (_, i) => {
    const day = isoDay(new Date(sinceDate.getTime() + i * DAY));
    return { day, views: viewMap.get(day) ?? 0 };
  });
  res.json({
    days, series, totalViews: series.reduce((s, d) => s + d.views, 0),
    topPaths: topPaths.map((p) => ({ path: p.path, views: p._count._all })),
    referrers: referrers.map((r) => ({ source: r.referrerHost ?? "Direct", views: r._count._all })),
    countries: countries.map((c) => ({ country: c.country ?? "Unknown", views: c._count._all })),
    topArticles: toApi(topArticles), topProjects: toApi(topProjects),
    subscriptions: subsByDay,
    messages: messagesByDay,
  });
}

export async function activity(req: Request, res: Response) {
  const { page, limit, skip } = pagination(req, 100);
  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, skip, take: limit, include: { user: { select: { id: true, name: true } } } }),
    prisma.activityLog.count(),
  ]);
  res.json({ items: toApi(items), total, page, pages: Math.ceil(total / limit) });
}
