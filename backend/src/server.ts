/**
 * Single entry point: one Node process serves the API and the Next.js frontend
 * on the port the host provides (Render sets PORT automatically).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextModule from "next";
import { config } from "./config/env.js";
import { connectDb, prisma } from "./config/db.js";
import { createApp } from "./app.js";

// `next` is CommonJS; under Node ESM its function may sit on `.default`.
const next = ((nextModule as unknown as { default?: unknown }).default ?? nextModule) as typeof import("next").default;

// Works from both backend/src (tsx) and backend/dist (compiled).
const frontendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../frontend");

// The frontend calls the API on this same server when rendering pages.
process.env.API_URL ??= `http://127.0.0.1:${config.port}`;

await connectDb();
console.log("[db] connected to PostgreSQL");

const nextApp = next({ dev: !config.isProd, dir: frontendDir });
await nextApp.prepare();
const handle = nextApp.getRequestHandler();

const app = createApp({ frontend: (req, res) => void handle(req, res) });
const server = app.listen(config.port, config.host, () => {
  console.log(`[server] AJENEZA M. Thierry website ready on http://localhost:${config.port}`);
});
if (!config.isProd) server.on("upgrade", nextApp.getUpgradeHandler()); // hot reload in development

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  });
}
