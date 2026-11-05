/**
 * Create (or reset the password of) the super administrator.
 * Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run create-admin
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { config } from "../config/env.js";
import { connectDb } from "../config/db.js";
import { User } from "../models/index.js";

const email = process.env.ADMIN_EMAIL?.toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME ?? "AJENEZA M. Thierry";
if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD");
if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");

await connectDb(config.mongoUri);
const passwordHash = await bcrypt.hash(password, 12);
await User.updateOne({ email }, { $set: { name, passwordHash, role: "superadmin" }, $unset: { lockedUntil: 1 } }, { upsert: true });
console.log(`Super administrator ready: ${email}`);
await mongoose.disconnect();
