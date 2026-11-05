import bcrypt from "bcryptjs";
import request from "supertest";
import { connectDb, prisma } from "../src/config/db.js";
import { createApp } from "../src/app.js";

export async function startTestEnv() {
  const testUrl = process.env.TEST_DATABASE_URL;
  if (!testUrl) throw new Error("Set TEST_DATABASE_URL to a dedicated PostgreSQL database before running API tests");
  const databaseName = new URL(testUrl).pathname.split("/").filter(Boolean)[0] ?? "";
  if (!databaseName.toLowerCase().includes("test")) throw new Error("TEST_DATABASE_URL must point to a database with 'test' in its name");
  process.env.DATABASE_URL = testUrl;
  await connectDb();
  await clearDatabase();
  const app = createApp();
  return {
    app,
    async stop() {
      await clearDatabase();
      await prisma.$disconnect();
    },
  };
}

async function clearDatabase() {
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.research.deleteMany();
  await prisma.venture.deleteMany();
  await prisma.project.deleteMany();
  await prisma.book.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.event.deleteMany();
  await prisma.timelineEntry.deleteMany();
  await prisma.readingItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.media.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.pageView.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.subscriber.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.user.deleteMany();
}

export async function createUser(role: "superadmin" | "editor" | "content_manager", email = `${role}@test.dev`, password = "a-very-long-password") {
  await prisma.user.create({ data: { name: role, email, role, passwordHash: await bcrypt.hash(password, 4) } });
  return { email, password };
}

/** Logs in and returns a supertest agent that keeps cookies and sends the CSRF header. */
export async function loginAgent(app: Parameters<typeof request.agent>[0], creds: { email: string; password: string }) {
  const agent = request.agent(app);
  const res = await agent.post("/api/v1/auth/login").set("X-Requested-With", "XMLHttpRequest").send(creds);
  if (res.status !== 200) throw new Error(`login failed: ${res.status} ${JSON.stringify(res.body)}`);
  return agent;
}
