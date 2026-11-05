import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import request from "supertest";
import { createApp } from "../src/app.js";
import { User } from "../src/models/index.js";

export async function startTestEnv() {
  // Use an existing server when MONGO_TEST_URI is set (e.g. CI service or Docker); otherwise start an in-memory one.
  const external = process.env.MONGO_TEST_URI;
  const mongo = external ? null : await MongoMemoryServer.create();
  const base = external ?? mongo!.getUri();
  await mongoose.connect(base, { dbName: `ajeneza_test_${Date.now()}` });
  const app = createApp();
  return {
    app,
    async stop() {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
      await mongo?.stop();
    },
  };
}

export async function createUser(role: "superadmin" | "editor" | "content_manager", email = `${role}@test.dev`, password = "a-very-long-password") {
  await User.create({ name: role, email, role, passwordHash: await bcrypt.hash(password, 4) });
  return { email, password };
}

/** Logs in and returns a supertest agent that keeps cookies and sends the CSRF header. */
export async function loginAgent(app: Parameters<typeof request.agent>[0], creds: { email: string; password: string }) {
  const agent = request.agent(app);
  const res = await agent.post("/api/v1/auth/login").set("X-Requested-With", "XMLHttpRequest").send(creds);
  if (res.status !== 200) throw new Error(`login failed: ${res.status} ${JSON.stringify(res.body)}`);
  return agent;
}
