/** Singletons (profile, settings), taxonomy, search and sitemap. */
import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { visibleFilter } from "../models/common.js";
import { logActivity } from "../services/activity.service.js";
import { q } from "../utils/http.js";
import { toApi } from "../utils/serialize.js";
import { schemas } from "../validators/index.js";

export async function getProfile(_req: Request, res: Response) {
  res.json(toApi((await prisma.profile.findUnique({ where: { id: "profile" } })) ?? {}));
}

export async function updateProfile(req: Request, res: Response) {
  const data = schemas.profile.parse(req.body);
  const doc = await prisma.profile.upsert({ where: { id: "profile" }, create: { id: "profile", ...data } as any, update: data as any });
  await logActivity(req, "update", "profile", doc.id, "Biography updated");
  res.json(toApi(doc));
}

export async function getSettings(_req: Request, res: Response) {
  res.json(toApi((await prisma.settings.findUnique({ where: { id: "settings" } })) ?? {}));
}

export async function updateSettings(req: Request, res: Response) {
  const data = schemas.settings.parse(req.body);
  const current = await prisma.settings.findUnique({ where: { id: "settings" } });
  const update: Record<string, any> = { ...data };
  if (data.now) update.now = { ...(current?.now as object ?? {}), ...data.now, updatedAt: new Date() };
  if (data.mediaKit) update.mediaKit = { ...(current?.mediaKit as object ?? {}), ...data.mediaKit };
  const doc = await prisma.settings.upsert({ where: { id: "settings" }, create: { id: "settings", ...update } as any, update: update as any });
  await logActivity(req, "update", "settings", doc.id, "Website settings updated");
  res.json(toApi(doc));
}

export async function listCategories(req: Request, res: Response) {
  const section = q(req, "section");
  res.json(toApi(await prisma.category.findMany({ where: section ? { section } : {}, orderBy: [{ order: "asc" }, { name: "asc" }] })));
}

export async function listTags(_req: Request, res: Response) {
  res.json(toApi(await prisma.tag.findMany({ orderBy: { name: "asc" } })));
}

export async function search(req: Request, res: Response) {
  const term = q(req, "q")?.trim();
  if (!term || term.length < 2) return res.json({ results: [] });
  const vis = visibleFilter();
  const contains = { contains: term, mode: "insensitive" as const };
  const [articles, projects, books, research] = await Promise.all([
    prisma.article.findMany({ where: { ...vis, OR: [{ title: contains }, { excerpt: contains }, { subtitle: contains }] }, select: { title: true, slug: true, section: true, excerpt: true }, take: 10 }),
    prisma.project.findMany({ where: { ...vis, OR: [{ title: contains }, { summary: contains }, { technologies: { has: term } }] }, select: { title: true, slug: true, summary: true }, take: 10 }),
    prisma.book.findMany({ where: { ...vis, OR: [{ title: contains }, { summary: contains }] }, select: { title: true, slug: true, summary: true }, take: 10 }),
    prisma.research.findMany({ where: { ...vis, OR: [{ title: contains }, { abstract: contains }] }, select: { title: true, slug: true, abstract: true }, take: 10 }),
  ]);
  res.json({
    results: [
      ...articles.map((a) => ({ type: a.section, title: a.title, summary: a.excerpt, url: `/${a.section}/${a.slug}` })),
      ...projects.map((p) => ({ type: "project", title: p.title, summary: p.summary, url: `/projects/${p.slug}` })),
      ...books.map((b) => ({ type: "book", title: b.title, summary: b.summary, url: `/books/${b.slug}` })),
      ...research.map((r) => ({ type: "research", title: r.title, summary: r.abstract, url: `/research/${r.slug}` })),
    ],
  });
}

export async function sitemap(_req: Request, res: Response) {
  const vis = visibleFilter();
  const [articles, books, projects, ventures, research] = await Promise.all([
    prisma.article.findMany({ where: vis, select: { slug: true, updatedAt: true, section: true, seo: true } }),
    prisma.book.findMany({ where: vis, select: { slug: true, updatedAt: true, seo: true } }),
    prisma.project.findMany({ where: vis, select: { slug: true, updatedAt: true, seo: true } }),
    prisma.venture.findMany({ where: vis, select: { slug: true, updatedAt: true, seo: true } }),
    prisma.research.findMany({ where: vis, select: { slug: true, updatedAt: true, seo: true } }),
  ]);
  const indexable = (items: any[]) => items.filter((item) => (item.seo as any)?.noindex !== true);
  res.json({
    entries: [
      ...indexable(articles).map((a) => ({ path: `/${a.section}/${a.slug}`, updatedAt: a.updatedAt })),
      ...indexable(books).map((b) => ({ path: `/books/${b.slug}`, updatedAt: b.updatedAt })),
      ...indexable(projects).map((p) => ({ path: `/projects/${p.slug}`, updatedAt: p.updatedAt })),
      ...indexable(ventures).map((v) => ({ path: `/ventures/${v.slug}`, updatedAt: v.updatedAt })),
      ...indexable(research).map((r) => ({ path: `/research/${r.slug}`, updatedAt: r.updatedAt })),
    ],
  });
}
