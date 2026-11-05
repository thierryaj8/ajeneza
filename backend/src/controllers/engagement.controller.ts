/** Visitor interactions and their admin management: contact messages, newsletter, comments. */
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/db.js";
import { visibleFilter } from "../models/common.js";
import { logActivity } from "../services/activity.service.js";
import { notify } from "../services/mail.service.js";
import { assertUuid, HttpError, pagination, q } from "../utils/http.js";
import { toApi } from "../utils/serialize.js";
import { schemas } from "../validators/index.js";

const CATEGORY_LABELS: Record<string, string> = {
  business: "Business collaboration", media: "Journalism and media", speaking: "Speaking invitation",
  technology: "Technology projects", publishing: "Publishing and literature", general: "General inquiry",
};

/* ---------- contact ---------- */

export async function submitContact(req: Request, res: Response) {
  const data = schemas.contact.parse(req.body);
  const msg = await prisma.contactMessage.create({ data });
  void notify(
    `[Website] ${CATEGORY_LABELS[data.category]}: ${data.subject}`,
    `From: ${data.name} <${data.email}>\nOrganization: ${data.organization || "-"}\nCategory: ${CATEGORY_LABELS[data.category]}\n\n${data.message}`,
    data.email,
  );
  res.status(201).json({ ok: true, id: msg.id });
}

export async function listMessages(req: Request, res: Response) {
  const { page, limit, skip } = pagination(req, 100);
  const where: Record<string, string> = {};
  const status = q(req, "status");
  if (status) where.status = status;
  const category = q(req, "category");
  if (category) where.category = category;
  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.contactMessage.count({ where }),
  ]);
  res.json({ items: toApi(items), total, page, pages: Math.ceil(total / limit) });
}

export async function setMessageStatus(req: Request, res: Response) {
  assertUuid(req.params.id);
  const { status } = z.object({ status: z.enum(["new", "read", "replied", "archived", "spam"]) }).parse(req.body);
  if (!await prisma.contactMessage.findUnique({ where: { id: req.params.id }, select: { id: true } })) throw new HttpError(404, "Not found");
  const doc = await prisma.contactMessage.update({ where: { id: req.params.id }, data: { status } });
  await logActivity(req, `mark_${status}`, "messages", doc.id, doc.subject);
  res.json(toApi(doc));
}

export async function deleteMessage(req: Request, res: Response) {
  assertUuid(req.params.id);
  const doc = await prisma.contactMessage.findUnique({ where: { id: req.params.id } });
  if (!doc) throw new HttpError(404, "Not found");
  await prisma.contactMessage.delete({ where: { id: req.params.id } });
  await logActivity(req, "delete", "messages", doc.id, doc.subject);
  res.status(204).end();
}

/* ---------- newsletter ---------- */

export async function subscribe(req: Request, res: Response) {
  const data = schemas.subscribe.parse(req.body);
  await prisma.subscriber.upsert({
    where: { email: data.email.toLowerCase() },
    create: { email: data.email.toLowerCase(), name: data.name, status: "active", source: data.source ?? "website" },
    update: { status: "active", ...(data.name ? { name: data.name } : {}) },
  });
  res.status(201).json({ ok: true });
}

export async function unsubscribe(req: Request, res: Response) {
  const { email } = schemas.subscribe.pick({ email: true }).parse(req.body);
  await prisma.subscriber.updateMany({ where: { email: email.toLowerCase() }, data: { status: "unsubscribed" } });
  res.json({ ok: true });
}

export async function listSubscribers(req: Request, res: Response) {
  const { page, limit, skip } = pagination(req, 200);
  const where: Record<string, any> = {};
  const status = q(req, "status");
  if (status) where.status = status;
  const search = q(req, "q");
  if (search) where.email = { contains: search, mode: "insensitive" };
  const [items, total] = await Promise.all([
    prisma.subscriber.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.subscriber.count({ where }),
  ]);
  res.json({ items: toApi(items), total, page, pages: Math.ceil(total / limit) });
}

export async function exportSubscribers(_req: Request, res: Response) {
  const subs = await prisma.subscriber.findMany({ where: { status: "active" }, orderBy: { createdAt: "asc" } });
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
  assertUuid(req.params.id);
  const doc = await prisma.subscriber.findUnique({ where: { id: req.params.id } });
  if (!doc) throw new HttpError(404, "Not found");
  await prisma.subscriber.delete({ where: { id: req.params.id } });
  await logActivity(req, "delete", "subscribers", doc.id, doc.email);
  res.status(204).end();
}

/* ---------- comments ---------- */

export async function listApprovedComments(req: Request, res: Response) {
  const article = await prisma.article.findFirst({ where: { slug: String(req.params.slug), ...visibleFilter() }, select: { id: true } });
  if (!article) throw new HttpError(404, "Not found");
  res.json(toApi(await prisma.comment.findMany({ where: { articleId: article.id, status: "approved" }, orderBy: { createdAt: "asc" }, select: { id: true, name: true, body: true, createdAt: true } })));
}

export async function submitComment(req: Request, res: Response) {
  const data = schemas.comment.parse(req.body);
  const settings = await prisma.settings.findUnique({ where: { id: "settings" }, select: { commentsEnabled: true } });
  const article = await prisma.article.findFirst({ where: { slug: String(req.params.slug), ...visibleFilter() }, select: { id: true, allowComments: true } });
  if (!article) throw new HttpError(404, "Not found");
  if (settings?.commentsEnabled === false || !article.allowComments) throw new HttpError(403, "Comments are closed");
  await prisma.comment.create({ data: { articleId: article.id, name: data.name, email: data.email, body: data.body } });
  res.status(202).json({ ok: true, message: "Thanks! Your comment will appear once it has been approved." });
}

export async function listComments(req: Request, res: Response) {
  const { page, limit, skip } = pagination(req, 100);
  const status = q(req, "status");
  const where = status ? { status } : {};
  const [items, total] = await Promise.all([
    prisma.comment.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit, include: { article: { select: { id: true, title: true, slug: true, section: true } } } }),
    prisma.comment.count({ where }),
  ]);
  res.json({ items: toApi(items), total, page, pages: Math.ceil(total / limit) });
}

export async function setCommentStatus(req: Request, res: Response) {
  assertUuid(req.params.id);
  const { status } = z.object({ status: z.enum(["pending", "approved", "spam"]) }).parse(req.body);
  if (!await prisma.comment.findUnique({ where: { id: req.params.id }, select: { id: true } })) throw new HttpError(404, "Not found");
  const doc = await prisma.comment.update({ where: { id: req.params.id }, data: { status } });
  await logActivity(req, `comment_${status}`, "comments", doc.id);
  res.json(toApi(doc));
}

export async function deleteComment(req: Request, res: Response) {
  assertUuid(req.params.id);
  const doc = await prisma.comment.findUnique({ where: { id: req.params.id } });
  if (!doc) throw new HttpError(404, "Not found");
  await prisma.comment.delete({ where: { id: req.params.id } });
  res.status(204).end();
}
