import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { isValidObjectId } from "mongoose";
import { User } from "../models/index.js";
import { logActivity } from "../services/activity.service.js";
import { HttpError } from "../utils/http.js";
import { schemas } from "../validators/index.js";

export async function list(_req: Request, res: Response) {
  res.json(await User.find().sort({ createdAt: 1 }).lean());
}

export async function create(req: Request, res: Response) {
  const data = schemas.user.parse(req.body);
  const user = await User.create({ name: data.name, email: data.email, role: data.role, passwordHash: await bcrypt.hash(data.password, 12) });
  await logActivity(req, "create", "users", String(user._id), user.email);
  res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
}

export async function remove(req: Request, res: Response) {
  if (!isValidObjectId(req.params.id)) throw new HttpError(400, "Invalid identifier");
  if (req.params.id === req.user!.id) throw new HttpError(400, "You cannot delete your own account");
  const doc = await User.findByIdAndDelete(req.params.id);
  if (!doc) throw new HttpError(404, "Not found");
  await logActivity(req, "delete", "users", String(doc._id), doc.email);
  res.status(204).end();
}
