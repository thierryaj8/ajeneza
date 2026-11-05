import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createUser, loginAgent, startTestEnv } from "./setup.js";
import { prisma } from "../src/config/db.js";
const XHR = { "X-Requested-With": "XMLHttpRequest" };

let env: Awaited<ReturnType<typeof startTestEnv>>;
let admin: ReturnType<typeof request.agent>;

beforeAll(async () => {
  env = await startTestEnv();
  admin = await loginAgent(env.app, await createUser("superadmin"));
});
afterAll(async () => env?.stop());

describe("auth", () => {
  it("rejects bad credentials with a generic message", async () => {
    const res = await request(env.app).post("/api/v1/auth/login").set(XHR).send({ email: "superadmin@test.dev", password: "wrong" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  it("sets httpOnly cookies and returns the current user", async () => {
    const res = await admin.get("/api/v1/auth/me");
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("superadmin");
  });

  it("blocks admin endpoints without a session", async () => {
    expect((await request(env.app).get("/api/v1/admin/articles")).status).toBe(401);
  });

  it("requires the CSRF header on cookie-authenticated writes", async () => {
    const res = await admin.post("/api/v1/admin/articles").send({ section: "blog", title: "x" });
    expect(res.status).toBe(403);
  });

  it("rotates refresh tokens and rejects reuse", async () => {
    const agent = await loginAgent(env.app, { email: "superadmin@test.dev", password: "a-very-long-password" });
    const first = await agent.post("/api/v1/auth/refresh").set(XHR);
    expect(first.status).toBe(200);
    const oldCookie = first.request.cookies; // the cookie sent with the first refresh
    const second = await agent.post("/api/v1/auth/refresh").set(XHR);
    expect(second.status).toBe(200);
    const replay = await request(env.app).post("/api/v1/auth/refresh").set(XHR).set("Cookie", oldCookie);
    expect(replay.status).toBe(401);
  });
});

describe("content publishing workflow", () => {
  it("creates a draft that is hidden from the public, then publishes it", async () => {
    const created = await admin.post("/api/v1/admin/articles").set(XHR).send({ section: "journalism", title: "African development and innovation", body: "word ".repeat(600) });
    expect(created.status).toBe(201);
    expect(created.body.slug).toBe("african-development-and-innovation");
    expect(created.body.readingTime).toBe(3);

    expect((await request(env.app).get("/api/v1/articles/african-development-and-innovation")).status).toBe(404);

    const updated = await admin.put(`/api/v1/admin/articles/${created.body._id}`).set(XHR).send({ status: "published" });
    expect(updated.status).toBe(200);
    expect(updated.body.publishedAt).toBeTruthy();

    const pub = await request(env.app).get("/api/v1/articles/african-development-and-innovation?section=journalism");
    expect(pub.status).toBe(200);
    expect(pub.body.createdBy).toBeUndefined();
  });

  it("generates unique slugs per section", async () => {
    const a = await admin.post("/api/v1/admin/articles").set(XHR).send({ section: "journalism", title: "African development and innovation" });
    expect(a.body.slug).toBe("african-development-and-innovation-2");
    const b = await admin.post("/api/v1/admin/articles").set(XHR).send({ section: "blog", title: "African development and innovation" });
    expect(b.body.slug).toBe("african-development-and-innovation");
  });

  it("shows scheduled content only after its publish time", async () => {
    const future = new Date(Date.now() + 864e5).toISOString();
    await admin.post("/api/v1/admin/projects").set(XHR).send({ title: "Future project", status: "scheduled", publishAt: future });
    await admin.post("/api/v1/admin/projects").set(XHR).send({ title: "Past project", status: "scheduled", publishAt: new Date(Date.now() - 1000).toISOString() });
    const list = await request(env.app).get("/api/v1/projects");
    const titles = list.body.items.map((p: { title: string }) => p.title);
    expect(titles).toContain("Past project");
    expect(titles).not.toContain("Future project");
  });

  it("rejects scheduling without a date and javascript: URLs", async () => {
    expect((await admin.post("/api/v1/admin/books").set(XHR).send({ title: "B", status: "scheduled" })).status).toBe(422);
    expect((await admin.post("/api/v1/admin/projects").set(XHR).send({ title: "P", githubUrl: "javascript:alert(1)" })).status).toBe(422);
  });

  it("stops content managers from publishing directly", async () => {
    const cm = await loginAgent(env.app, await createUser("content_manager"));
    const res = await cm.post("/api/v1/admin/articles").set(XHR).send({ section: "blog", title: "From a content manager", status: "published" });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("in_review");
    expect((await cm.put("/api/v1/admin/settings").set(XHR).send({ tagline: "x" })).status).toBe(403);
  });

  it("ignores Mongo operators in query strings and bodies", async () => {
    const res = await request(env.app).get("/api/v1/articles?section[$ne]=x&q[$gt]=");
    expect(res.status).toBe(200);
    const login = await request(env.app).post("/api/v1/auth/login").set(XHR).send({ email: { $gt: "" }, password: { $gt: "" } });
    expect(login.status).toBe(422);
  });
});

describe("visitor interactions", () => {
  it("stores contact messages and silently drops honeypot spam", async () => {
    const ok = await request(env.app).post("/api/v1/contact").send({ name: "Jane", email: "jane@example.com", subject: "Hello", message: "I would like to collaborate.", category: "business" });
    expect(ok.status).toBe(201);
    const spam = await request(env.app).post("/api/v1/contact").send({ name: "Bot", email: "bot@example.com", subject: "Buy", message: "Spam spam spam spam", website: "x" });
    expect(spam.status).toBe(422); // honeypot must be empty
    expect(await prisma.contactMessage.count()).toBe(1);

    const inbox = await admin.get("/api/v1/admin/messages");
    expect(inbox.body.total).toBe(1);
    const marked = await admin.patch(`/api/v1/admin/messages/${inbox.body.items[0]._id}/status`).set(XHR).send({ status: "read" });
    expect(marked.body.status).toBe("read");
  });

  it("subscribes idempotently", async () => {
    await request(env.app).post("/api/v1/newsletter/subscribe").send({ email: "Reader@Example.com" });
    await request(env.app).post("/api/v1/newsletter/subscribe").send({ email: "reader@example.com" });
    expect(await prisma.subscriber.count()).toBe(1);
    const csv = await admin.get("/api/v1/admin/subscribers/export");
    expect(csv.text).toContain("reader@example.com");
  });

  it("holds comments for moderation", async () => {
    const res = await request(env.app).post("/api/v1/articles/african-development-and-innovation/comments").send({ name: "R", email: "r@example.com", body: "Great piece" });
    expect(res.status).toBe(202);
    expect((await request(env.app).get("/api/v1/articles/african-development-and-innovation/comments")).body).toHaveLength(0);
    const c = await prisma.comment.findFirst();
    await admin.patch(`/api/v1/admin/comments/${c!.id}/status`).set(XHR).send({ status: "approved" });
    expect((await request(env.app).get("/api/v1/articles/african-development-and-innovation/comments")).body).toHaveLength(1);
  });

  it("records page views without personal data and counts article views", async () => {
    await request(env.app).post("/api/v1/track").send({ path: "/journalism/african-development-and-innovation", referrer: "https://news.example.org/x" });
    await request(env.app).post("/api/v1/track").set("DNT", "1").send({ path: "/" });
    const a = await prisma.article.findFirst({ where: { section: "journalism", slug: "african-development-and-innovation" } });
    expect(a!.views).toBe(1);
    const analytics = await admin.get("/api/v1/admin/dashboard/analytics?days=7");
    expect(analytics.body.totalViews).toBe(1);
    expect(analytics.body.referrers[0].source).toBe("news.example.org");
  });
});

describe("media", () => {
  const png = Buffer.from("89504e470d0a1a0a0000000d4948445200000001000000010806000000", "hex");

  it("accepts a real image and rejects disguised files", async () => {
    const ok = await admin.post("/api/v1/admin/media/upload").set(XHR).field("folder", "covers").attach("file", png, { filename: "a.png", contentType: "image/png" });
    expect(ok.status).toBe(201);
    expect(ok.body.kind).toBe("image");
    const fake = await admin.post("/api/v1/admin/media/upload").set(XHR).attach("file", Buffer.from("<script>alert(1)</script>"), { filename: "x.png", contentType: "image/png" });
    expect(fake.status).toBe(415);
    const svg = await admin.post("/api/v1/admin/media/upload").set(XHR).attach("file", Buffer.from("<svg/>"), { filename: "x.svg", contentType: "image/svg+xml" });
    expect(svg.status).toBe(415);
    const del = await admin.delete(`/api/v1/admin/media/${ok.body._id}`).set(XHR);
    expect(del.status).toBe(204);
  });

  it("reports dashboard counts", async () => {
    const res = await admin.get("/api/v1/admin/dashboard/overview");
    expect(res.status).toBe(200);
    expect(res.body.counts.totalArticles).toBeGreaterThan(0);
    expect(res.body.counts.subscribers).toBe(1);
  });
});
