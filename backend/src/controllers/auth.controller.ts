import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import {
  clearAuthCookies, hashTokenId, newTokenId, REFRESH_COOKIE, setAuthCookies, signAccess, signRefresh, verifyRefresh,
} from "../services/token.service.js";
import { HttpError } from "../utils/http.js";
import { schemas } from "../validators/index.js";

const MAX_FAILED = 5;
const LOCK_MS = 15 * 60 * 1000;
// Compared against when the email is unknown, so response timing does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

const publicUser = (u: { id: string; name: string; email: string; role: string }) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

async function issueTokens(res: Response, user: { id: string; role: string; name: string }) {
  const jti = newTokenId();
  await prisma.user.update({ where: { id: user.id }, data: { refreshTokenId: hashTokenId(jti) } });
  setAuthCookies(res, signAccess({ sub: user.id, role: user.role as never, name: user.name }), signRefresh(user.id, jti));
}

export async function login(req: Request, res: Response) {
  const { email, password } = schemas.login.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (user?.lockedUntil && user.lockedUntil > new Date()) throw new HttpError(423, "Account temporarily locked. Try again later.");
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) {
    if (user) {
      const failed = (user.failedLogins ?? 0) + 1;
      await prisma.user.update({ where: { id: user.id }, data: failed >= MAX_FAILED ? { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MS) } : { failedLogins: failed } });
    }
    throw new HttpError(401, "Invalid email or password");
  }
  await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() } });
  await issueTokens(res, user);
  await prisma.activityLog.create({ data: { userId: user.id, action: "login", resource: "auth" } });
  res.json({ user: publicUser(user) });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new HttpError(401, "No session");
  let claims: { sub: string; jti: string };
  try {
    claims = verifyRefresh(token);
  } catch {
    clearAuthCookies(res);
    throw new HttpError(401, "Session expired");
  }
  const user = await prisma.user.findUnique({ where: { id: claims.sub } });
  if (!user || user.refreshTokenId !== hashTokenId(claims.jti)) {
    // Token reuse or revoked session: end every session for this user.
    if (user) await prisma.user.update({ where: { id: user.id }, data: { refreshTokenId: null } });
    clearAuthCookies(res);
    throw new HttpError(401, "Session revoked");
  }
  await issueTokens(res, user);
  res.json({ user: publicUser(user) });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    try {
      const { sub } = verifyRefresh(token);
      await prisma.user.updateMany({ where: { id: sub }, data: { refreshTokenId: null } });
    } catch { /* already invalid */ }
  }
  clearAuthCookies(res);
  res.json({ ok: true });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw new HttpError(401, "Account no longer exists");
  res.json({ user: publicUser(user) });
}

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = schemas.password.parse(req.body);
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) throw new HttpError(400, "Current password is incorrect");
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } });
  await issueTokens(res, user); // rotates the refresh token, signing out other sessions
  res.json({ ok: true });
}
