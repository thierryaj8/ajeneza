import type { NextFunction, Request, Response } from "express";
import { ACCESS_COOKIE, verifyAccess } from "../services/token.service.js";
import { HttpError } from "../utils/http.js";
import type { Role } from "../models/index.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request { user?: { id: string; role: Role; name: string } }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = req.cookies?.[ACCESS_COOKIE] ?? (header?.startsWith("Bearer ") ? header.slice(7) : undefined);
  if (!token) return next(new HttpError(401, "Authentication required"));
  try {
    const claims = verifyAccess(token);
    req.user = { id: claims.sub, role: claims.role, name: claims.name };
    next();
  } catch {
    next(new HttpError(401, "Session expired"));
  }
}

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, "Authentication required"));
    if (!roles.includes(req.user.role)) return next(new HttpError(403, "You do not have permission for this action"));
    next();
  };

/**
 * CSRF defence for cookie-authenticated, state-changing requests.
 * Cookies are SameSite=strict; additionally require a custom header, which a
 * cross-site form or image cannot send without a CORS preflight we would reject.
 */
export function requireCsrfHeader(req: Request, _res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (req.headers.authorization?.startsWith("Bearer ")) return next();
  if (req.get("x-requested-with") !== "XMLHttpRequest") return next(new HttpError(403, "Missing CSRF header"));
  next();
}
