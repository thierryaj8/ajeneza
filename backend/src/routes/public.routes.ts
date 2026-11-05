import { Router } from "express";
import { resources } from "../config/resources.js";
import * as analytics from "../controllers/analytics.controller.js";
import * as content from "../controllers/content.controller.js";
import * as engage from "../controllers/engagement.controller.js";
import * as site from "../controllers/site.controller.js";
import { formLimiter, trackLimiter } from "../middleware/rateLimit.middleware.js";
import { asyncHandler as h } from "../utils/http.js";

export const publicRoutes = Router();

publicRoutes.get("/profile", h(site.getProfile));
publicRoutes.get("/settings", h(site.getSettings));
publicRoutes.get("/categories", h(site.listCategories));
publicRoutes.get("/tags", h(site.listTags));
publicRoutes.get("/search", h(site.search));
publicRoutes.get("/sitemap", h(site.sitemap));

// Comments are registered before the generic "/articles/:slug" route.
publicRoutes.get("/articles/:slug/comments", h(engage.listApprovedComments));
publicRoutes.post("/articles/:slug/comments", formLimiter, h(engage.submitComment));

const PUBLIC_COLLECTIONS = ["articles", "books", "projects", "ventures", "achievements", "events", "timeline", "research", "reading-list"];
for (const name of PUBLIC_COLLECTIONS) {
  publicRoutes.get(`/${name}`, h(content.publicList(resources[name])));
  publicRoutes.get(`/${name}/:slug`, h(content.publicGet(resources[name])));
}

publicRoutes.post("/contact", formLimiter, h(engage.submitContact));
publicRoutes.post("/newsletter/subscribe", formLimiter, h(engage.subscribe));
publicRoutes.post("/newsletter/unsubscribe", formLimiter, h(engage.unsubscribe));
publicRoutes.post("/track", trackLimiter, h(analytics.track));
