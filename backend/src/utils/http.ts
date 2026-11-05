import type { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);

/** Read a query-string value as a plain string, ignoring arrays/objects (blocks operator injection). */
export function q(req: Request, key: string): string | undefined {
  const v = req.query[key];
  return typeof v === "string" && v.length <= 200 ? v : undefined;
}

export function pagination(req: Request, maxLimit = 50) {
  const page = Math.max(1, Number.parseInt(q(req, "page") ?? "1", 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(q(req, "limit") ?? "12", 10) || 12));
  return { page, limit, skip: (page - 1) * limit };
}

export function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
