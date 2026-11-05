/**
 * Generic controller for every collection in config/resources.ts
 * (articles, books, projects, ventures, events, timeline, research, ...).
 * Public handlers only ever return visible (published / due) content.
 */
import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import type { ResourceDef } from "../config/resources.js";
import { CONTENT_STATUSES, Category, Tag, visibleFilter } from "../models/index.js";
import { logActivity } from "../services/activity.service.js";
import { uniqueSlug } from "../services/slug.service.js";
import { escapeRegex, HttpError, pagination, q } from "../utils/http.js";

const ADMIN_ONLY_FIELDS = "-createdBy -updatedBy";
const LIST_FILTERS = ["section", "kind", "type", "shelf", "devStatus", "publicationStatus"];

/* ---------------- public ---------------- */

export const publicList = (def: ResourceDef) => async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req, 100);
  const filter: Record<string, unknown> = { ...visibleFilter() };

  for (const key of LIST_FILTERS) {
    const v = q(req, key);
    if (v && def.model.schema.path(key)) filter[key] = v;
  }
  const projectCategory = q(req, "projectCategory");
  if (projectCategory && def.name === "projects") filter.categories = { $in: projectCategory.split(",") };
  const timelineCategory = q(req, "timelineCategory");
  if (timelineCategory && def.name === "timeline") filter.category = timelineCategory;
  if (q(req, "featured") === "true") filter.featured = true;
  const exclude = q(req, "exclude");
  if (exclude) filter.slug = { $ne: exclude };

  const categorySlug = q(req, "category");
  if (categorySlug && def.model.schema.path("category")) {
    const section = q(req, "section");
    const cat = await Category.findOne({ slug: categorySlug, ...(section ? { section } : {}) }).lean();
    if (!cat) return res.json({ items: [], total: 0, page, pages: 0 });
    filter.category = cat._id;
  }
  const tagSlug = q(req, "tag");
  if (tagSlug && def.model.schema.path("tags")) {
    const tag = await Tag.findOne({ slug: tagSlug }).lean();
    if (!tag) return res.json({ items: [], total: 0, page, pages: 0 });
    filter.tags = tag._id;
  }
  const search = q(req, "q");
  if (search) filter.$and = [{ $or: def.searchFields.map((f) => ({ [f]: { $regex: escapeRegex(search), $options: "i" } })) }];

  const sort = q(req, "sort") === "popular" && def.model.schema.path("views") ? { views: -1 as const } : def.publicSort;
  const select = `${ADMIN_ONLY_FIELDS} -body -excerpts`; // listings omit long bodies
  const [items, total] = await Promise.all([
    def.model.find(filter).sort(sort).skip(skip).limit(limit).select(select).populate(def.populate ?? []).lean(),
    def.model.countDocuments(filter),
  ]);
  res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
};

export const publicGet = (def: ResourceDef) => async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = { slug: String(req.params.slug), ...visibleFilter() };
  const section = q(req, "section");
  if (section && def.model.schema.path("section")) filter.section = section;
  const item = await def.model.findOne(filter).select(ADMIN_ONLY_FIELDS).populate(def.populate ?? []).lean();
  if (!item) throw new HttpError(404, "Not found");
  res.json(item);
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

const scopeOf = (def: ResourceDef, data: Record<string, unknown>) => Object.fromEntries((def.slugScope ?? []).map((k) => [k, data[k]]));
const assertId = (id: string) => { if (!isValidObjectId(id)) throw new HttpError(400, "Invalid identifier"); };

export const adminList = (def: ResourceDef) => async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req, 100);
  const filter: Record<string, unknown> = {};
  const status = q(req, "status");
  if (status && def.publishable && (CONTENT_STATUSES as readonly string[]).includes(status)) filter.status = status;
  for (const key of [...LIST_FILTERS, "category"]) {
    const v = q(req, key);
    if (v && def.model.schema.path(key)) filter[key] = v;
  }
  const search = q(req, "q");
  if (search) filter.$or = def.searchFields.map((f) => ({ [f]: { $regex: escapeRegex(search), $options: "i" } }));
  const [items, total] = await Promise.all([
    def.model.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).populate(def.populate ?? []).lean(),
    def.model.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
};

export const adminGet = (def: ResourceDef) => async (req: Request, res: Response) => {
  assertId(req.params.id);
  const item = await def.model.findById(req.params.id).lean();
  if (!item) throw new HttpError(404, "Not found");
  res.json(item);
};

export const adminCreate = (def: ResourceDef) => async (req: Request, res: Response) => {
  const data = normalise(def.schema.parse(req.body) as Record<string, unknown>);
  enforcePublishingRights(req, data);
  data.slug = await uniqueSlug(def.model, (data.slug as string) || (data[def.titleField] as string), scopeOf(def, data));
  if (def.publishable) Object.assign(data, { createdBy: req.user!.id, updatedBy: req.user!.id });
  if (def.name === "articles") data.author = req.user!.id;
  const doc = await def.model.create(data);
  await logActivity(req, "create", def.name, String(doc._id), String(data[def.titleField]));
  res.status(201).json(doc);
};

export const adminUpdate = (def: ResourceDef) => async (req: Request, res: Response) => {
  assertId(req.params.id);
  const doc = await def.model.findById(req.params.id);
  if (!doc) throw new HttpError(404, "Not found");
  const data = normalise(def.schema.partial().parse(req.body) as Record<string, unknown>);
  if (data.publishAt === undefined && doc.get("publishAt")) data.publishAt = doc.get("publishAt");
  enforcePublishingRights(req, data);
  if (data.slug !== undefined || (def.slugScope ?? []).some((k) => k in data)) {
    const scope = scopeOf(def, { ...doc.toObject(), ...data });
    data.slug = await uniqueSlug(def.model, (data.slug as string) || doc.get("slug"), scope, String(doc._id));
  }
  if (def.publishable) data.updatedBy = req.user!.id;
  doc.set(data);
  await doc.save(); // runs model hooks (reading time, publishedAt)
  await logActivity(req, "update", def.name, String(doc._id), String(doc.get(def.titleField)));
  res.json(doc);
};

export const adminDelete = (def: ResourceDef) => async (req: Request, res: Response) => {
  assertId(req.params.id);
  const doc = await def.model.findByIdAndDelete(req.params.id);
  if (!doc) throw new HttpError(404, "Not found");
  await logActivity(req, "delete", def.name, String(doc._id), String(doc.get(def.titleField)));
  res.status(204).end();
};
