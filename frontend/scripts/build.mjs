/**
 * Runs `next build` with NODE_ENV=production.
 *
 * Next.js requires production mode for a production build. Inheriting a shell's
 * NODE_ENV=development makes static generation of /_global-error fail, so the
 * build script sets it explicitly and works on Windows, macOS and Linux.
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const result = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "production" },
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);
