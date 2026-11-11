import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";

/**
 * Creates the first super administrator on a brand-new database.
 *
 * Runs once at startup so a fresh deployment (for example after recreating the
 * database) does not leave `/admin/login` returning 401. It only acts when the
 * `User` table is completely empty, so existing accounts, password changes and
 * deliberately removed users are never overwritten.
 *
 * Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) to enable it. When they
 * are not configured, a warning is logged and `npm run create-admin` remains
 * the manual recovery path.
 */
export async function ensureFirstAdmin() {
  try {
    if ((await prisma.user.count()) > 0) return;

    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.warn(
        "[bootstrap] No users exist. Set ADMIN_EMAIL and ADMIN_PASSWORD, or run `npm run create-admin`, to create the first administrator.",
      );
      return;
    }
    if (password.length < 12) {
      console.warn("[bootstrap] ADMIN_PASSWORD must be at least 12 characters; skipping first-administrator creation.");
      return;
    }

    await prisma.user.create({
      data: {
        name: process.env.ADMIN_NAME?.trim() || "AJENEZA M. Thierry",
        email,
        role: "superadmin",
        passwordHash: await bcrypt.hash(password, 12),
      },
    });
    console.log(`[bootstrap] Created the first super administrator: ${email}`);
  } catch (error) {
    // Never prevent the public site from starting because of an optional seed.
    console.error("[bootstrap] Could not create the first administrator:", error);
  }
}
