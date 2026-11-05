import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { CookieOptions, Response } from "express";
import { config } from "../config/env.js";
import type { Role } from "../models/index.js";

export interface AccessClaims { sub: string; role: Role; name: string }

export const ACCESS_COOKIE = "am_access";
export const REFRESH_COOKIE = "am_refresh";
/** Carries no secret: lets the web app's middleware know a session may exist without exposing the refresh token. */
export const SESSION_HINT_COOKIE = "am_session";

export function signAccess(claims: AccessClaims) {
  return jwt.sign(claims, config.jwtAccessSecret, { expiresIn: config.accessTtlSeconds, audience: "admin", issuer: "ajeneza-api" });
}
export function verifyAccess(token: string) {
  return jwt.verify(token, config.jwtAccessSecret, { audience: "admin", issuer: "ajeneza-api" }) as AccessClaims;
}
export function signRefresh(sub: string, jti: string) {
  return jwt.sign({ sub, jti }, config.jwtRefreshSecret, { expiresIn: config.refreshTtlSeconds, audience: "refresh", issuer: "ajeneza-api" });
}
export function verifyRefresh(token: string) {
  return jwt.verify(token, config.jwtRefreshSecret, { audience: "refresh", issuer: "ajeneza-api" }) as { sub: string; jti: string };
}
export const newTokenId = () => crypto.randomBytes(24).toString("hex");
export const hashTokenId = (jti: string) => crypto.createHash("sha256").update(jti).digest("hex");

const base: CookieOptions = { httpOnly: true, sameSite: "strict", secure: config.isProd, path: "/" };

export function setAuthCookies(res: Response, access: string, refresh: string) {
  res.cookie(ACCESS_COOKIE, access, { ...base, maxAge: config.accessTtlSeconds * 1000 });
  res.cookie(REFRESH_COOKIE, refresh, { ...base, path: "/api/v1/auth", maxAge: config.refreshTtlSeconds * 1000 });
  res.cookie(SESSION_HINT_COOKIE, "1", { ...base, maxAge: config.refreshTtlSeconds * 1000 });
}
export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, base);
  res.clearCookie(REFRESH_COOKIE, { ...base, path: "/api/v1/auth" });
  res.clearCookie(SESSION_HINT_COOKIE, base);
}
