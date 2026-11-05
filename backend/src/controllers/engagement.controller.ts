/** Visitor interactions and their admin management: contact messages, newsletter, comments. */
import type { Request, Response } from "express";
import { z } from "zod";
import { Article, Comment, ContactMessage, Settings, Subscriber, visibleFilter } from "../models/index.js";
import { logActivity } from "../services/activity.service.js";
import { notify } from "../services/mail.service.js";
import { escapeRegex, HttpError, pagination, q } from "../utils/http.js";
import { schemas } from "../validators/index.js";

const CATEGORY_LABELS: Record<string, string> = {
  business: "Business collaboration", media: "Journalism and media", speaking: "Speaking invitation",
  technology: "Technology projects", publishing: "Publishing and literature", general: "General inquiry",
};

/* ---------- contact ---------- */

export async function submitContact(req: Request, res: Response) {
  const data = schemas.contact.parse(req.body);
  const msg = await ContactMessage.create(data);
  void notify(
    `[Website] ${CATEGORY_LABELS[data.category]}: ${data.subject}`,
    `From: ${data.name} <${data.email}>\nOrganization: ${data.organization || "-"}\nCategory: ${CATEGORY_LABELS[data.category]}\n\n${data.message}`,
    data.email,
  );
  res.status(201).json({ ok: true, id: msg._id });
}

export async function listMessages(req: Request, res: Response) {
  const { page, limit, skip } = pagination(req, 100);
  const filter: Record<string, unknown> = {};
  const status = q(req, "status");
  if (status) filter.status = status;
  const category = q(req, "category");
  if (category) filter.category = category;
  const [items, total] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ContactMessage.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}

export async function setMessageStatus(req: Request, res: Response) {
  const { status } = z.object({ status: z.enum(["new", "read", "replied", "archived", "spam"]) }).parse(req.body);
  const doc = await ContactMessage.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!doc) throw new HttpError(404, "Not found");
  await logActivity(req, `mark_${status}`, "messages", String(doc._id), doc.subject);
  res.json(doc);
}

export async function deleteMessage(req: Request, res: Response) {
  const doc = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!doc) throw new HttpError(404, "Not found");
  await logActivity(req, "delete", "messages", String(doc._id), doc.subject);
  res.status(204).end();
}

/* ---------- newsletter ---------- */

export async function subscribe(req: Request, res: Response) {
  const data = schemas.subscribe.parse(req.body);
  await Subscriber.updateOne(
    { email: data.email.toLowerCase() },
    { $set: { status: "active", ...(data.name ? { name: data.name } : {}) }, $setOnInsert: { source: data.source ?? "website" } },
    { upsert: true },
  );
  res.status(201).json({ ok: true });
}

export async function unsubscribe(req: Request, res: Response) {
  const { email } = schemas.subscribe.pick({ email: true }).parse(req.body);
  await Subscriber.updateOne({ email: email.toLowerCase() }, { $set: { status: "unsubscribed" } });
  res.json({ ok: true });
}

export async function listSubscribers(req: Request, res: Response) {
  const { page, limit, skip } = pagination(req, 200);
  const filter: Record<string, unknown> = {};
  const status = q(req, "status");
  if (status) filter.status = status;
  const search = q(req, "q");
  if (search) filter.email = { $regex: escapeRegex(search), $options: "i" };
  const [items, total] = await Promise.all([
    Subscriber.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Subscriber.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}

export async function exportSubscribers(_req: Request, res: Response) {
  const subs = await Subscriber.find({ status: "active" }).sort({ createdAt: 1 }).lean();
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s; // block CSV formula injection
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const rows = ["email,name,source,subscribed_at", ...subs.map((s) => [s.email, s.name, s.source, s.createdAt?.toISOString()].map(esc).join(","))];
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="subscribers.csv"');
  res.send(rows.join("\n"));
}

export async function deleteSubscriber(req: Request, res: Response) {
  const doc = await Subscriber.findByIdAndDelete(req.params.id);
  if (!doc) throw new HttpError(404, "Not found");
  await logActivity(req, "delete", "subscribers", String(doc._id), doc.email);
  res.status(204).end();
}

/* ---------- comments ---------- */

export async function listApprovedComments(req: Request, res: Response) {
  const article = await Article.findOne({ slug: String(req.params.slug), ...visibleFilter() }).select("_id").lean();
  if (!article) throw new HttpError(404, "Not found");
  res.json(await Comment.find({ article: article._id, status: "approved" }).sort({ createdAt: 1 }).select("name body createdAt").lean());
}

export async function submitComment(req: Request, res: Response) {
  const data = schemas.comment.parse(req.body);
  const settings = await Settings.findOne().select("commentsEnabled").lean();
  const article = await Article.findOne({ slug: String(req.params.slug), ...visibleFilter() }).select("_id allowComments").lean();
  if (!article) throw new HttpError(404, "Not found");
  if (settings?.commentsEnabled === false || !article.allowComments) throw new HttpError(403, "Comments are closed");
  await Comment.create({ article: article._id, name: data.name, email: data.email, body: data.body });
  res.status(202).json({ ok: true, message: "Thanks! Your comment will appear once it has been approved." });
}

export async function listComments(req: Request, res: Response) {
  const { page, limit, skip } = pagination(req, 100);
  const status = q(req, "status");
  const filter = status ? { status } : {};
  const [items, total] = await Promise.all([
    Comment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select("+email").populate("article", "title slug section").lean(),
    Comment.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}

export async function setCommentStatus(req: Request, res: Response) {
  const { status } = z.object({ status: z.enum(["pending", "approved", "spam"]) }).parse(req.body);
  const doc = await Comment.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!doc) throw new HttpError(404, "Not found");
  await logActivity(req, `comment_${status}`, "comments", String(doc._id));
  res.json(doc);
}

export async function deleteComment(req: Request, res: Response) {
  const doc = await Comment.findByIdAndDelete(req.params.id);
  if (!doc) throw new HttpError(404, "Not found");
  res.status(204).end();
}
