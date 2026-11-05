import type { Request, Response } from "express";
import { z } from "zod";
import { Media } from "../models/index.js";
import { logActivity } from "../services/activity.service.js";
import { ALLOWED_TYPES, removeFile, storeFile } from "../services/storage.service.js";
import { escapeRegex, HttpError, pagination, q } from "../utils/http.js";
import { safeUrl } from "../validators/index.js";

const folderName = z.string().trim().max(60).regex(/^[\w -]*$/);
const EMBED_HOSTS = /^(www\.)?(youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com)$/i;

export async function upload(req: Request, res: Response) {
  if (!req.file) throw new HttpError(400, "No file uploaded");
  const meta = z.object({ folder: folderName.optional(), alt: z.string().max(300).optional(), name: z.string().max(200).optional() }).parse(req.body ?? {});
  const folder = meta.folder || "general";
  const stored = await storeFile(req.file, folder.replace(/\s+/g, "-").toLowerCase());
  const doc = await Media.create({
    name: meta.name || req.file.originalname.slice(0, 200),
    url: stored.url, provider: stored.provider, providerId: stored.providerId,
    kind: ALLOWED_TYPES[req.file.mimetype].kind, mimeType: req.file.mimetype, size: req.file.size,
    width: stored.width, height: stored.height, alt: meta.alt ?? "", folder, uploadedBy: req.user!.id,
  });
  await logActivity(req, "upload", "media", String(doc._id), doc.name);
  res.status(201).json(doc);
}

export async function addEmbed(req: Request, res: Response) {
  const data = z.object({ url: safeUrl, name: z.string().trim().min(1).max(200), folder: folderName.optional() }).parse(req.body);
  if (!/^https?:\/\//.test(data.url) || !EMBED_HOSTS.test(new URL(data.url).hostname)) throw new HttpError(422, "Only YouTube and Vimeo embeds are supported");
  const doc = await Media.create({ name: data.name, url: data.url, provider: "embed", kind: "video", folder: data.folder || "videos", uploadedBy: req.user!.id });
  res.status(201).json(doc);
}

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = pagination(req, 100);
  const filter: Record<string, unknown> = {};
  const kind = q(req, "kind");
  if (kind) filter.kind = kind;
  const folder = q(req, "folder");
  if (folder) filter.folder = folder;
  const search = q(req, "q");
  if (search) filter.$or = [{ name: { $regex: escapeRegex(search), $options: "i" } }, { alt: { $regex: escapeRegex(search), $options: "i" } }];
  const [items, total, folders] = await Promise.all([
    Media.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Media.countDocuments(filter),
    Media.distinct("folder"),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit), folders });
}

export async function update(req: Request, res: Response) {
  const data = z.object({ name: z.string().trim().min(1).max(200), alt: z.string().max(300), folder: folderName }).partial().parse(req.body);
  const doc = await Media.findByIdAndUpdate(req.params.id, { $set: data }, { new: true });
  if (!doc) throw new HttpError(404, "Not found");
  await logActivity(req, "update", "media", String(doc._id), doc.name);
  res.json(doc);
}

export async function remove(req: Request, res: Response) {
  const doc = await Media.findByIdAndDelete(req.params.id);
  if (!doc) throw new HttpError(404, "Not found");
  await removeFile(doc.provider, doc.providerId ?? undefined, doc.kind);
  await logActivity(req, "delete", "media", String(doc._id), doc.name);
  res.status(204).end();
}
