/**
 * Seeds placeholder content and the first super administrator.
 *   npm run seed            # only fills an empty database
 *   npm run seed -- --reset # wipes content collections first (never users)
 */
import bcrypt from "bcryptjs";
import { connectDb, prisma } from "../config/db.js";
import { readingTimeMinutes } from "../models/common.js";
import { slugify } from "../services/slug.service.js";
import * as data from "./seed-data.js";

export async function seed({ reset = false } = {}) {
  // Ensure the administrator exists before the content check below can return
  // early, so `npm run seed` also repairs a database that has content but no
  // usable login (for example after recreating the database).
  const email = (process.env.ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  let admin =
    (await prisma.user.findFirst({ where: { role: "superadmin" } })) ??
    (await prisma.user.findUnique({ where: { email } }));
  if (!admin) {
    const password = process.env.ADMIN_PASSWORD;
    if (!password || password.length < 12) throw new Error("Set ADMIN_PASSWORD (12+ characters) to create the first administrator");
    admin = await prisma.user.create({ data: { name: process.env.ADMIN_NAME ?? "AJENEZA M. Thierry", email, role: "superadmin", passwordHash: await bcrypt.hash(password, 12) } });
    console.log(`Created super administrator ${email}`);
  }

  if (reset) {
    await prisma.$transaction([
      prisma.comment.deleteMany(), prisma.article.deleteMany(), prisma.book.deleteMany(), prisma.project.deleteMany(),
      prisma.venture.deleteMany(), prisma.achievement.deleteMany(), prisma.event.deleteMany(), prisma.timelineEntry.deleteMany(),
      prisma.research.deleteMany(), prisma.readingItem.deleteMany(), prisma.category.deleteMany(), prisma.tag.deleteMany(),
      prisma.profile.deleteMany(), prisma.settings.deleteMany(),
    ]);
  } else if (await prisma.article.count()) {
    console.log("Database already has content; skipping. Use --reset to replace it.");
    return;
  }

  const published = { status: "published", createdBy: admin.id, updatedBy: admin.id };
  await prisma.settings.upsert({ where: { id: "settings" }, create: { id: "settings", ...data.settings } as any, update: data.settings as any });
  await prisma.profile.upsert({ where: { id: "profile" }, create: { id: "profile", ...data.profile } as any, update: data.profile as any });

  const categories: Awaited<ReturnType<typeof prisma.category.create>>[] = [];
  for (const category of data.categories) categories.push(await prisma.category.create({ data: { ...category, slug: slugify(category.name) } }));
  const categoryId = (section: string, name: string) => categories.find((category) => category.section === section && category.name === name)?.id;

  for (const article of data.articles) {
    const { category, ...fields } = article;
    await prisma.article.create({ data: {
      ...fields, ...published, slug: slugify(article.title.replace("[Placeholder]", "")),
      categoryId: categoryId(article.section, category), authorId: admin.id, readingTime: readingTimeMinutes(article.body),
    } as any });
  }
  const projects = [];
  for (const [order, project] of data.projects.entries()) {
    projects.push(await prisma.project.create({ data: { ...project, ...published, order, slug: slugify(project.title.replace("[Placeholder]", "")) } as any }));
  }
  for (const book of data.books) await prisma.book.create({ data: { ...book, ...published, slug: slugify(book.title.replace("[Placeholder]", "")) } as any });
  for (const venture of data.ventures) {
    await prisma.venture.create({ data: {
      ...venture, ...published, slug: slugify(venture.title),
      projects: { create: projects.slice(0, 1).map((project) => ({ project: { connect: { id: project.id } } })) },
    } as any });
  }
  for (const event of data.events) await prisma.event.create({ data: { ...event, ...published, slug: slugify(event.title.replace("[Placeholder]", "")) } as any });
  for (const entry of data.timeline) await prisma.timelineEntry.create({ data: { ...entry, ...published, slug: slugify(entry.title.replace("[Placeholder]", "")) } as any });
  for (const entry of data.research) await prisma.research.create({ data: { ...entry, ...published, slug: slugify(entry.title.replace("[Placeholder]", "")), readingTime: readingTimeMinutes(entry.body) } as any });
  for (const item of data.reading) await prisma.readingItem.create({ data: { ...item, ...published, slug: slugify(item.title.replace("[Placeholder]", "")) } as any });
  console.log("Seeded placeholder content.");
}

if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  await connectDb();
  try {
    await seed({ reset: process.argv.includes("--reset") });
  } finally {
    await prisma.$disconnect();
  }
}
