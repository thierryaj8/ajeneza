import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import multer from "multer";
import { HttpError } from "../utils/http.js";
import { config } from "../config/env.js";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, "Not found"));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({ error: "Validation failed", details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })) });
  }
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message, details: err.details });
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
  if (err instanceof mongoose.Error.CastError) return res.status(400).json({ error: "Invalid identifier" });
  if (err instanceof mongoose.Error.ValidationError) return res.status(422).json({ error: err.message });
  if (typeof err === "object" && err && (err as { code?: number }).code === 11000) {
    return res.status(409).json({ error: "An item with this slug or email already exists" });
  }
  if (typeof err === "object" && err && (err as { type?: string }).type === "entity.too.large") {
    return res.status(413).json({ error: "Request body too large" });
  }
  console.error(err);
  res.status(500).json({ error: config.isProd ? "Internal server error" : String((err as Error)?.message ?? err) });
}
