/**
 * Create (or reset the password of) the super administrator.
 * Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run create-admin
 */
import bcrypt from "bcryptjs";
import { connectDb, prisma } from "../config/db.js";

const email = process.env.ADMIN_EMAIL?.toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME ?? "AJENEZA M. Thierry";
if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD");
if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");

await connectDb();
const passwordHash = await bcrypt.hash(password, 12);
await prisma.user.upsert({
	where: { email },
	create: { name, email, passwordHash, role: "superadmin" },
	update: { name, passwordHash, role: "superadmin", failedLogins: 0, lockedUntil: null, refreshTokenId: null },
});
console.log(`Super administrator ready: ${email}`);
await prisma.$disconnect();
