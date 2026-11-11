/**
 * Create the super administrator, or reset its password with `--reset`.
 * Usage:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run create-admin
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run create-admin -- --reset
 */
import bcrypt from "bcryptjs";
import { connectDb, prisma } from "../config/db.js";

const email = process.env.ADMIN_EMAIL?.toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME ?? "AJENEZA M. Thierry";
const reset = process.argv.includes("--reset");
if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD");
if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");

await connectDb();

const existing = await prisma.user.findUnique({ where: { email } });
if (existing && !reset) {
  console.log(`Super administrator already exists: ${email}. Use --reset to change the password.`);
  await prisma.$disconnect();
  process.exit(0);
}

const passwordHash = await bcrypt.hash(password, 12);
await prisma.user.upsert({
	where: { email },
	create: { name, email, passwordHash, role: "superadmin" },
	update: { name, passwordHash, role: "superadmin", failedLogins: 0, lockedUntil: null, refreshTokenId: null },
});
console.log(reset ? `Super administrator password reset: ${email}` : `Super administrator ready: ${email}`);
await prisma.$disconnect();
