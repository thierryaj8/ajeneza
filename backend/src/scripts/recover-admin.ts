/**
 * TEMPORARY RECOVERY SCRIPT — remove after the password has been changed.
 *
 * Resets the super administrator to a known password exactly once. The password
 * is stored as a bcrypt hash so the public repository never contains the
 * plaintext. A marker row in ActivityLog makes the reset one-time: after the
 * first run, later builds skip it, so a password changed in the admin UI is
 * preserved.
 */
import { connectDb, prisma } from "../config/db.js";

const EMAIL = "admin@example.com";
const PASSWORD_HASH = "$2a$12$3UXf3pCVt40GkoK4vG96FefhBRsOpdqnn.RobciltpnGinFwNZu2y";
const MARKER = "system:admin-recovery-2026-11-11";

await connectDb();

const alreadyRecovered = await prisma.activityLog.findFirst({ where: { action: MARKER } });
if (alreadyRecovered) {
  console.log("Admin recovery already applied; skipping.");
  await prisma.$disconnect();
  process.exit(0);
}

const admin = await prisma.user.upsert({
  where: { email: EMAIL },
  create: { name: "AJENEZA M. Thierry", email: EMAIL, passwordHash: PASSWORD_HASH, role: "superadmin" },
  update: { passwordHash: PASSWORD_HASH, role: "superadmin", failedLogins: 0, lockedUntil: null, refreshTokenId: null },
});

await prisma.activityLog.create({
  data: { userId: admin.id, action: MARKER, resource: "auth", summary: "Temporary admin recovery applied" },
});
console.log(`Recovery administrator ready: ${EMAIL}`);
await prisma.$disconnect();
