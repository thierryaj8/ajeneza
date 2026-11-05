import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { logActivity } from "../services/activity.service.js";
import { assertUuid, HttpError } from "../utils/http.js";
import { toApi } from "../utils/serialize.js";
import { schemas } from "../validators/index.js";

export async function list(_req: Request, res: Response) {
  res.json(toApi(await prisma.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true, lastLoginAt: true, createdAt: true, updatedAt: true } })));
}

export async function create(req: Request, res: Response) {
  const data = schemas.user.parse(req.body);
  const user = await prisma.user.create({ data: { name: data.name, email: data.email.toLowerCase(), role: data.role, passwordHash: await bcrypt.hash(data.password, 12) } });
  await logActivity(req, "create", "users", user.id, user.email);
  res.status(201).json(toApi({ id: user.id, name: user.name, email: user.email, role: user.role }));
}

export async function remove(req: Request, res: Response) {
  assertUuid(req.params.id);
  if (req.params.id === req.user!.id) throw new HttpError(400, "You cannot delete your own account");
  const doc = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!doc) throw new HttpError(404, "Not found");
  await prisma.user.delete({ where: { id: req.params.id } });
  await logActivity(req, "delete", "users", doc.id, doc.email);
  res.status(204).end();
}
