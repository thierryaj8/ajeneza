/** Privacy-conscious page-view tracking and the admin dashboard statistics. */
import type { Request, Response } from "express";
import {
  ActivityLog, Article, Book, Comment, ContactMessage, Event, PageView, Project, Research, Settings, Subscriber, Venture,
} from "../models/index.js";
import { pagination, q } from "../utils/http.js";
import { schemas } from "../validators/index.js";

const DAY = 864e5;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

export async function track(req: Request, res: Response) {
  if (req.get("dnt") === "1" || req.get("sec-gpc") === "1") return res.status(204).end();
  const parsed = schemas.track.safeParse(req.body);
  if (!parsed.success) return res.status(204).end();
  const settings = await Settings.findOne().select("analyticsEnabled").lean();
  if (settings?.analyticsEnabled === false) return res.status(204).end();

  const path = parsed.data.path.split("?")[0].slice(0, 300);
  if (path.startsWith("/admin")) return res.status(204).end();
  let referrerHost: string | undefined;
  try {
    referrerHost = parsed.data.referrer ? new URL(parsed.data.referrer).hostname : undefined;
  } catch { /* ignore malformed referrer */ }
  // No IP, cookie or user agent is stored; only an approximate country from the CDN, when available.
  const country = (req.get("cf-ipcountry") || req.get("x-vercel-ip-country") || "").slice(0, 2).toUpperCase() || undefined;
  await PageView.create({ path, referrerHost, country, day: isoDay(new Date()) });

  const m = path.match(/^\/(journalism|blog|projects)\/([a-z0-9-]+)$/);
  if (m) {
    if (m[1] === "projects") await Project.updateOne({ slug: m[2] }, { $inc: { views: 1 } });
    else await Article.updateOne({ section: m[1], slug: m[2] }, { $inc: { views: 1 } });
  }
  res.status(204).end();
}

export async function overview(_req: Request, res: Response) {
  const since = isoDay(new Date(Date.now() - 30 * DAY));
  const [
    totalArticles, publishedArticles, draftArticles, reviewArticles, totalProjects, totalBooks, totalVentures, totalEvents, totalResearch,
    subscribers, messages, newMessages, pendingComments, visits30, recentActivity,
  ] = await Promise.all([
    Article.countDocuments(), Article.countDocuments({ status: "published" }), Article.countDocuments({ status: "draft" }),
    Article.countDocuments({ status: "in_review" }), Project.countDocuments(), Book.countDocuments(), Venture.countDocuments(),
    Event.countDocuments(), Research.countDocuments(), Subscriber.countDocuments({ status: "active" }), ContactMessage.countDocuments(),
    ContactMessage.countDocuments({ status: "new" }), Comment.countDocuments({ status: "pending" }), PageView.countDocuments({ day: { $gte: since } }),
    ActivityLog.find().sort({ createdAt: -1 }).limit(12).populate("user", "name").lean(),
  ]);
  res.json({
    counts: {
      totalArticles, publishedArticles, draftArticles, reviewArticles, totalProjects, totalBooks, totalVentures, totalEvents, totalResearch,
      subscribers, messages, newMessages, pendingComments, visits30,
    },
    recentActivity,
  });
}

export async function analytics(req: Request, res: Response) {
  const days = Math.min(365, Math.max(7, Number(q(req, "days") ?? 30) || 30));
  const sinceDate = new Date(Date.now() - (days - 1) * DAY);
  const match = { $match: { day: { $gte: isoDay(sinceDate) } } };
  const perDay = (Model: typeof Subscriber | typeof ContactMessage) =>
    Model.aggregate([{ $match: { createdAt: { $gte: sinceDate } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
  const [byDay, topPaths, referrers, countries, topArticles, topProjects, subsByDay, messagesByDay] = await Promise.all([
    PageView.aggregate([match, { $group: { _id: "$day", views: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    PageView.aggregate([match, { $group: { _id: "$path", views: { $sum: 1 } } }, { $sort: { views: -1 } }, { $limit: 10 }]),
    PageView.aggregate([match, { $group: { _id: { $ifNull: ["$referrerHost", "Direct"] }, views: { $sum: 1 } } }, { $sort: { views: -1 } }, { $limit: 10 }]),
    PageView.aggregate([match, { $group: { _id: { $ifNull: ["$country", "Unknown"] }, views: { $sum: 1 } } }, { $sort: { views: -1 } }, { $limit: 10 }]),
    Article.find().sort({ views: -1 }).limit(5).select("title slug section views").lean(),
    Project.find().sort({ views: -1 }).limit(5).select("title slug views").lean(),
    perDay(Subscriber), perDay(ContactMessage),
  ]);
  // Fill missing days with zero so the chart has a continuous axis.
  const viewMap = new Map(byDay.map((d) => [d._id, d.views]));
  const series = Array.from({ length: days }, (_, i) => {
    const day = isoDay(new Date(sinceDate.getTime() + i * DAY));
    return { day, views: viewMap.get(day) ?? 0 };
  });
  res.json({
    days, series, totalViews: series.reduce((s, d) => s + d.views, 0),
    topPaths: topPaths.map((p) => ({ path: p._id, views: p.views })),
    referrers: referrers.map((r) => ({ source: r._id, views: r.views })),
    countries: countries.map((c) => ({ country: c._id, views: c.views })),
    topArticles, topProjects,
    subscriptions: subsByDay.map((s) => ({ day: s._id, count: s.count })),
    messages: messagesByDay.map((m) => ({ day: m._id, count: m.count })),
  });
}

export async function activity(req: Request, res: Response) {
  const { page, limit, skip } = pagination(req, 100);
  const [items, total] = await Promise.all([
    ActivityLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user", "name").lean(),
    ActivityLog.countDocuments(),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}
