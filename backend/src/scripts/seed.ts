/**
 * Seeds placeholder content and the first super administrator.
 *   npm run seed            # only fills an empty database
 *   npm run seed -- --reset # wipes content collections first (never users)
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { config } from "../config/env.js";
import { connectDb } from "../config/db.js";
import { slugify } from "../services/slug.service.js";
import {
  Article, Book, Category, Event, Profile, Project, ReadingItem, Research, Settings, TimelineEntry, User, Venture,
} from "../models/index.js";
import * as data from "./seed-data.js";

export async function seed({ reset = false } = {}) {
  if (reset) {
    await Promise.all(([Article, Book, Category, Event, Profile, Project, ReadingItem, Research, Settings, TimelineEntry, Venture] as mongoose.Model<any>[]).map((m) => m.deleteMany({})));
  } else if (await Article.estimatedDocumentCount()) {
    console.log("Database already has content; skipping. Use --reset to replace it.");
    return;
  }

  const email = (process.env.ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  let admin = await User.findOne({ email });
  if (!admin) {
    const password = process.env.ADMIN_PASSWORD;
    if (!password || password.length < 12) throw new Error("Set ADMIN_PASSWORD (12+ characters) to create the first administrator");
    admin = await User.create({ name: process.env.ADMIN_NAME ?? "AJENEZA M. Thierry", email, role: "superadmin", passwordHash: await bcrypt.hash(password, 12) });
    console.log(`Created super administrator ${email}`);
  }

  const published = { status: "published", createdBy: admin._id, updatedBy: admin._id };
  await Settings.create(data.settings);
  await Profile.create(data.profile);
  const cats = await Category.insertMany(data.categories.map((c) => ({ ...c, slug: slugify(c.name) })));
  const catId = (section: string, name: string) => cats.find((c) => c.section === section && c.name === name)?._id;

  for (const a of data.articles) {
    await Article.create({ ...a, ...published, slug: slugify(a.title.replace("[Placeholder]", "")), category: catId(a.section, a.category), author: admin._id });
  }
  const projects = [];
  for (const [i, p] of data.projects.entries()) projects.push(await Project.create({ ...p, ...published, order: i, slug: slugify(p.title.replace("[Placeholder]", "")) }));
  for (const b of data.books) await Book.create({ ...b, ...published, slug: slugify(b.title.replace("[Placeholder]", "")) });
  for (const v of data.ventures) await Venture.create({ ...v, ...published, slug: slugify(v.title), projects: projects.slice(0, 1).map((p) => p._id) });
  for (const e of data.events) await Event.create({ ...e, ...published, slug: slugify(e.title.replace("[Placeholder]", "")) });
  for (const t of data.timeline) await TimelineEntry.create({ ...t, ...published, slug: slugify(t.title.replace("[Placeholder]", "")) });
  for (const r of data.research) await Research.create({ ...r, ...published, slug: slugify(r.title.replace("[Placeholder]", "")) });
  for (const r of data.reading) await ReadingItem.create({ ...r, ...published, slug: slugify(r.title.replace("[Placeholder]", "")) });
  console.log("Seeded placeholder content.");
}

if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  await connectDb(config.mongoUri);
  await seed({ reset: process.argv.includes("--reset") });
  await mongoose.disconnect();
}
