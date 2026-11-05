import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import {
  clearAuthCookies, hashTokenId, newTokenId, REFRESH_COOKIE, setAuthCookies, signAccess, signRefresh, verifyRefresh,
} from "../services/token.service.js";
import { HttpError } from "../utils/http.js";
import { schemas } from "../validators/index.js";
import { ActivityLog, User } from "../models/index.js";

const MAX_FAILED = 5;
const LOCK_MS = 15 * 60 * 1000;
// Compared against when the email is unknown, so response timing does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

const publicUser = (u: { _id: unknown; name: string; email: string; role: string }) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

async function issueTokens(res: Response, user: { _id: unknown; role: string; name: string }) {
  const jti = newTokenId();
  await User.updateOne({ _id: user._id }, { $set: { refreshTokenId: hashTokenId(jti) } });
  setAuthCookies(res, signAccess({ sub: String(user._id), role: user.role as never, name: user.name }), signRefresh(String(user._id), jti));
}

export async function login(req: Request, res: Response) {
  const { email, password } = schemas.login.parse(req.body);
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash +failedLogins +lockedUntil");
  if (user?.lockedUntil && user.lockedUntil > new Date()) throw new HttpError(423, "Account temporarily locked. Try again later.");
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) {
    if (user) {
      const failed = (user.failedLogins ?? 0) + 1;
      await User.updateOne({ _id: user._id }, failed >= MAX_FAILED ? { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MS) } : { failedLogins: failed });
    }
    throw new HttpError(401, "Invalid email or password");
  }
  await User.updateOne({ _id: user._id }, { $set: { failedLogins: 0, lastLoginAt: new Date() }, $unset: { lockedUntil: 1 } });
  await issueTokens(res, user);
  await ActivityLog.create({ user: user._id, action: "login", resource: "auth" });
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
  const user = await User.findById(claims.sub).select("+refreshTokenId");
  if (!user || user.refreshTokenId !== hashTokenId(claims.jti)) {
    // Token reuse or revoked session: end every session for this user.
    if (user) await User.updateOne({ _id: user._id }, { $unset: { refreshTokenId: 1 } });
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
      await User.updateOne({ _id: sub }, { $unset: { refreshTokenId: 1 } });
    } catch { /* already invalid */ }
  }
  clearAuthCookies(res);
  res.json({ ok: true });
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.user!.id).lean();
  if (!user) throw new HttpError(401, "Account no longer exists");
  res.json({ user: publicUser(user) });
}

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = schemas.password.parse(req.body);
  const user = await User.findById(req.user!.id).select("+passwordHash");
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) throw new HttpError(400, "Current password is incorrect");
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  await issueTokens(res, user); // rotates the refresh token, signing out other sessions
  res.json({ ok: true });
}
