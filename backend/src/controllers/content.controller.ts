/**
 * Generic controller for every collection in config/resources.ts
 * (articles, books, projects, ventures, events, timeline, research, ...).
 * Public handlers only ever return visible (published / due) content.
 */
import type { Request, Response } from "express";
import type { ResourceDef } from "../config/resources.js";
import { prisma } from "../config/db.js";
import { CONTENT_STATUSES, readingTimeMinutes, visibleFilter } from "../models/index.js";
import { logActivity } from "../services/activity.service.js";
import { slugify } from "../services/slug.service.js";
import { HttpError, pagination, q } from "../utils/http.js";
import { toApi } from "../utils/serialize.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function includeOf(def: ResourceDef) {
  return def.include;
}

function searchWhere(def: ResourceDef, search: string) {
  const clauses = def.searchFields.map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
  if (def.name === "projects") clauses.push({ technologies: { has: search } } as any);
  return clauses;
}

async function uniqueSlug(def: ResourceDef, base: string, scope: Record<string, unknown>, excludeId?: string) {
  const root = slugify(base);
  let candidate = root;
  for (let suffix = 2; suffix < 500; suffix++) {
    const existing = await def.model.findFirst({
      where: { ...scope, slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${root}-${suffix}`;
  }
  return `${root}-${Date.now()}`;
}

function prismaData(def: ResourceDef, data: Record<string, any>, update = false) {
  const result = { ...data };
  if ("category" in result) {
    result.categoryId = result.category || null;
    delete result.category;
  }
  if ("author" in result) {
    result.authorId = result.author || null;
    delete result.author;
  }
  if ("tags" in result) {
    const ids = result.tags as string[];
    result.tags = update
      ? { deleteMany: {}, create: ids.map((tagId) => ({ tag: { connect: { id: tagId } } })) }
      : { create: ids.map((tagId) => ({ tag: { connect: { id: tagId } } })) };
  }
  if ("projects" in result && def.name === "ventures") {
    const ids = result.projects as string[];
    result.projects = update
      ? { deleteMany: {}, create: ids.map((projectId) => ({ project: { connect: { id: projectId } } })) }
      : { create: ids.map((projectId) => ({ project: { connect: { id: projectId } } })) };
  }
  return result;
}

function assertId(id: string) {
  if (!UUID.test(id)) throw new HttpError(400, "Invalid identifier");
}

/* ---------------- public ---------------- */

export const publicList = (def: ResourceDef) => async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req, 100);
  const where: Record<string, any> = def.publishable ? { ...visibleFilter() } : {};
  for (const key of def.filterFields) {
    const v = q(req, key);
    if (v) where[key] = v;
  }
  const projectCategory = q(req, "projectCategory");
  if (projectCategory && def.name === "projects") where.categories = { hasSome: projectCategory.split(",") };
  const timelineCategory = q(req, "timelineCategory");
  if (timelineCategory && def.name === "timeline") where.category = timelineCategory;
  if (q(req, "featured") === "true") where.featured = true;
  const exclude = q(req, "exclude");
  if (exclude) where.slug = { not: exclude };

  const categorySlug = q(req, "category");
  if (categorySlug && ["articles", "research"].includes(def.name)) {
    const section = q(req, "section");
    const cat = await prisma.category.findFirst({ where: { slug: categorySlug, ...(section ? { section } : {}) } });
    if (!cat) return res.json({ items: [], total: 0, page, pages: 0 });
    where.categoryId = cat.id;
  }
  const tagSlug = q(req, "tag");
  if (tagSlug && ["articles", "research"].includes(def.name)) {
    const tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
    if (!tag) return res.json({ items: [], total: 0, page, pages: 0 });
    where.tags = { some: { tagId: tag.id } };
  }
  const search = q(req, "q");
  if (search) where.AND = [{ OR: searchWhere(def, search) }];
  const sort = q(req, "sort") === "popular" && ["articles", "projects"].includes(def.name) ? { views: "desc" } : def.publicSort;
  const [items, total] = await Promise.all([
    def.model.findMany({ where, orderBy: sort, skip, take: limit, include: includeOf(def) }),
    def.model.count({ where }),
  ]);
  const publicItems = items.map((item: any) => {
    const clean = toApi(item);
    delete clean.body;
    delete clean.excerpts;
    delete clean.createdBy;
    delete clean.updatedBy;
    return clean;
  });
  res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
  res.json({ items: publicItems, total, page, pages: Math.ceil(total / limit) });
};

export const publicGet = (def: ResourceDef) => async (req: Request, res: Response) => {
  const where: Record<string, any> = { slug: String(req.params.slug), ...visibleFilter() };
  const section = q(req, "section");
  if (section && def.filterFields.includes("section")) where.section = section;
  const item = await def.model.findFirst({ where, include: includeOf(def) });
  if (!item) throw new HttpError(404, "Not found");
  const clean = toApi(item);
  delete clean.createdBy;
  delete clean.updatedBy;
  res.json(clean);
};

/* ---------------- admin ---------------- */

/** Content managers may draft and submit for review; only editors and admins publish. */
function enforcePublishingRights(req: Request, data: Record<string, unknown>) {
  if (req.user?.role === "content_manager" && (data.status === "published" || data.status === "scheduled")) data.status = "in_review";
  if (data.status === "scheduled" && !data.publishAt) throw new HttpError(422, "Scheduled content needs a publish date");
}

/** Empty strings from forms mean "unset" for references. */
function normalise(data: Record<string, unknown>) {
  if (data.category === "") data.category = null;
  return data;
}

const scopeOf = (def: ResourceDef, data: Record<string, unknown>) => Object.fromEntries((def.slugScope ?? []).map((key) => [key, data[key]]));

export const adminList = (def: ResourceDef) => async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req, 100);
  const where: Record<string, any> = {};
  const status = q(req, "status");
  if (status && def.publishable && (CONTENT_STATUSES as readonly string[]).includes(status)) where.status = status;
  for (const key of def.filterFields) {
    const v = q(req, key);
    if (v) where[key] = v;
  }
  const categoryId = q(req, "category");
  if (categoryId && ["articles", "research"].includes(def.name)) where.categoryId = categoryId;
  const search = q(req, "q");
  if (search) where.OR = searchWhere(def, search);
  const [items, total] = await Promise.all([
    def.model.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take: limit, include: includeOf(def) }),
    def.model.count({ where }),
  ]);
  res.json({ items: toApi(items), total, page, pages: Math.ceil(total / limit) });
};

export const adminGet = (def: ResourceDef) => async (req: Request, res: Response) => {
  assertId(req.params.id);
  const item = await def.model.findUnique({ where: { id: req.params.id }, include: includeOf(def) });
  if (!item) throw new HttpError(404, "Not found");
  res.json(toApi(item));
};

export const adminCreate = (def: ResourceDef) => async (req: Request, res: Response) => {
  const data = normalise(def.schema.parse(req.body) as Record<string, unknown>);
  enforcePublishingRights(req, data);
  data.slug = await uniqueSlug(def, (data.slug as string) || (data[def.titleField] as string), scopeOf(def, data));
  if (def.publishable) Object.assign(data, { createdBy: req.user!.id, updatedBy: req.user!.id });
  if (def.name === "articles") data.author = req.user!.id;
  if (data.status === "published" && !data.publishedAt) data.publishedAt = new Date();
  if (data.status === "scheduled" && data.publishAt) data.publishedAt = data.publishAt;
  if (["articles", "research"].includes(def.name) && typeof data.body === "string") data.readingTime = readingTimeMinutes(data.body);
  const doc = await def.model.create({ data: prismaData(def, data), include: includeOf(def) });
  await logActivity(req, "create", def.name, String(doc.id), String(data[def.titleField]));
  res.status(201).json(toApi(doc));
};

export const adminUpdate = (def: ResourceDef) => async (req: Request, res: Response) => {
  assertId(req.params.id);
  const current = await def.model.findUnique({ where: { id: req.params.id } });
  if (!current) throw new HttpError(404, "Not found");
  const data = normalise(def.schema.partial().parse(req.body) as Record<string, unknown>);
  if (data.publishAt === undefined && current.publishAt) data.publishAt = current.publishAt;
  enforcePublishingRights(req, data);
  if (data.slug !== undefined || (def.slugScope ?? []).some((k) => k in data)) {
    const merged = { ...current, ...data };
    data.slug = await uniqueSlug(def, (data.slug as string) || current.slug, scopeOf(def, merged), current.id);
  }
  if (def.publishable) data.updatedBy = req.user!.id;
  if (data.status === "published" && !current.publishedAt) data.publishedAt = new Date();
  if (data.status === "scheduled" && data.publishAt) data.publishedAt = data.publishAt;
  if (["articles", "research"].includes(def.name) && typeof data.body === "string") data.readingTime = readingTimeMinutes(data.body);
  const doc = await def.model.update({ where: { id: current.id }, data: prismaData(def, data, true), include: includeOf(def) });
  await logActivity(req, "update", def.name, String(doc.id), String(doc[def.titleField]));
  res.json(toApi(doc));
};

export const adminDelete = (def: ResourceDef) => async (req: Request, res: Response) => {
  assertId(req.params.id);
  const doc = await def.model.findUnique({ where: { id: req.params.id } });
  if (!doc) throw new HttpError(404, "Not found");
  await def.model.delete({ where: { id: req.params.id } });
  await logActivity(req, "delete", def.name, String(doc.id), String(doc[def.titleField]));
  res.status(204).end();
};
