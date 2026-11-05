/** Singletons (profile, settings), taxonomy, search and sitemap. */
import type { Request, Response } from "express";
import { Article, Book, Category, Profile, Project, Research, Settings, Tag, Venture, visibleFilter } from "../models/index.js";
import { logActivity } from "../services/activity.service.js";
import { escapeRegex, q } from "../utils/http.js";
import { schemas } from "../validators/index.js";

export async function getProfile(_req: Request, res: Response) {
  res.json((await Profile.findOne().lean()) ?? {});
}

export async function updateProfile(req: Request, res: Response) {
  const data = schemas.profile.parse(req.body);
  const doc = await Profile.findOneAndUpdate({}, { $set: data }, { upsert: true, new: true, runValidators: true });
  await logActivity(req, "update", "profile", String(doc._id), "Biography updated");
  res.json(doc);
}

export async function getSettings(_req: Request, res: Response) {
  res.json((await Settings.findOne().lean()) ?? {});
}

export async function updateSettings(req: Request, res: Response) {
  const data = schemas.settings.parse(req.body);
  const update: Record<string, unknown> = { ...data };
  // Nested groups are merged field by field so a partial save keeps the rest.
  for (const group of ["now", "mediaKit"] as const) {
    if (!data[group]) continue;
    delete update[group];
    for (const [k, v] of Object.entries(data[group]!)) update[`${group}.${k}`] = v;
  }
  if (data.now) update["now.updatedAt"] = new Date();
  const doc = await Settings.findOneAndUpdate({}, { $set: update }, { upsert: true, new: true, runValidators: true });
  await logActivity(req, "update", "settings", String(doc._id), "Website settings updated");
  res.json(doc);
}

export async function listCategories(req: Request, res: Response) {
  const section = q(req, "section");
  res.json(await Category.find(section ? { section } : {}).sort({ order: 1, name: 1 }).lean());
}

export async function listTags(_req: Request, res: Response) {
  res.json(await Tag.find().sort({ name: 1 }).lean());
}

export async function search(req: Request, res: Response) {
  const term = q(req, "q")?.trim();
  if (!term || term.length < 2) return res.json({ results: [] });
  const rx = { $regex: escapeRegex(term), $options: "i" };
  const vis = visibleFilter();
  const [articles, projects, books, research] = await Promise.all([
    Article.find({ ...vis, $and: [{ $or: [{ title: rx }, { excerpt: rx }, { subtitle: rx }] }] }).select("title slug section excerpt").limit(10).lean(),
    Project.find({ ...vis, $and: [{ $or: [{ title: rx }, { summary: rx }, { technologies: rx }] }] }).select("title slug summary").limit(10).lean(),
    Book.find({ ...vis, $and: [{ $or: [{ title: rx }, { summary: rx }] }] }).select("title slug summary").limit(10).lean(),
    Research.find({ ...vis, $and: [{ $or: [{ title: rx }, { abstract: rx }] }] }).select("title slug abstract").limit(10).lean(),
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
  const vis = { ...visibleFilter(), "seo.noindex": { $ne: true } };
  const pick = "slug updatedAt section";
  const [articles, books, projects, ventures, research] = await Promise.all([
    Article.find(vis).select(pick).lean(), Book.find(vis).select(pick).lean(), Project.find(vis).select(pick).lean(),
    Venture.find(vis).select(pick).lean(), Research.find(vis).select(pick).lean(),
  ]);
  res.json({
    entries: [
      ...articles.map((a) => ({ path: `/${a.section}/${a.slug}`, updatedAt: a.updatedAt })),
      ...books.map((b) => ({ path: `/books/${b.slug}`, updatedAt: b.updatedAt })),
      ...projects.map((p) => ({ path: `/projects/${p.slug}`, updatedAt: p.updatedAt })),
      ...ventures.map((v) => ({ path: `/ventures/${v.slug}`, updatedAt: v.updatedAt })),
      ...research.map((r) => ({ path: `/research/${r.slug}`, updatedAt: r.updatedAt })),
    ],
  });
}
