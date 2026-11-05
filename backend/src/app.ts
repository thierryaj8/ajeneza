import path from "node:path";
import express, { type RequestHandler } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import { sanitizeBody } from "./middleware/sanitize.middleware.js";
import { apiRouter } from "./routes/index.js";

/**
 * Builds the Express application.
 *  - /api/v1/*  REST API (JSON)
 *  - /uploads/* locally stored media (when Cloudinary is not configured)
 *  - /health    health check for Render
 *  - anything else is passed to `frontend` (the Next.js request handler) when provided.
 */
export function createApp({ frontend }: { frontend?: RequestHandler } = {}) {
  const app = express();
  app.disable("x-powered-by");
  if (config.trustProxy) app.set("trust proxy", config.trustProxy);
  if (!config.isTest) app.use(morgan(config.isProd ? "combined" : "dev"));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use(
    "/uploads",
    helmet({ crossOriginResourcePolicy: { policy: "same-site" } }),
    express.static(path.resolve(config.uploadDir), {
      maxAge: "30d",
      immutable: true,
      setHeaders: (res) => res.setHeader("Content-Security-Policy", "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox"),
    }),
  );

  const api = express.Router();
  api.use(helmet());
  if (config.corsOrigins.length) {
    api.use(cors({ origin: config.corsOrigins, credentials: true, allowedHeaders: ["Content-Type", "X-Requested-With", "Authorization"] }));
  }
  api.use(express.json({ limit: "1mb" }), cookieParser(), sanitizeBody);
  api.use(apiRouter);
  api.use(notFound);
  app.use("/api/v1", api);

  // The website (pages, assets, admin UI). Security headers for pages come from frontend/next.config.ts.
  app.use(frontend ?? notFound);
  app.use(errorHandler);
  return app;
}
