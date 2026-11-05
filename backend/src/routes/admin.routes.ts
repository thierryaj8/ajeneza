import { Router } from "express";
import { resources } from "../config/resources.js";
import * as analytics from "../controllers/analytics.controller.js";
import * as content from "../controllers/content.controller.js";
import * as engage from "../controllers/engagement.controller.js";
import * as media from "../controllers/media.controller.js";
import * as site from "../controllers/site.controller.js";
import * as users from "../controllers/user.controller.js";
import { requireAuth, requireCsrfHeader, requireRole } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import { asyncHandler as h } from "../utils/http.js";

export const adminRoutes = Router();

const staff = requireRole("superadmin", "editor", "content_manager");
const editors = requireRole("superadmin", "editor");
const superadmin = requireRole("superadmin");

// Every admin endpoint: signed in, CSRF header, and at least a staff role.
adminRoutes.use(requireAuth, requireCsrfHeader, staff);

// Profile & settings
adminRoutes.get("/profile", h(site.getProfile));
adminRoutes.put("/profile", editors, h(site.updateProfile));
adminRoutes.get("/settings", h(site.getSettings));
adminRoutes.put("/settings", superadmin, h(site.updateSettings));

// Messages
adminRoutes.get("/messages", h(engage.listMessages));
adminRoutes.patch("/messages/:id/status", h(engage.setMessageStatus));
adminRoutes.delete("/messages/:id", editors, h(engage.deleteMessage));

// Newsletter
adminRoutes.get("/subscribers", h(engage.listSubscribers));
adminRoutes.get("/subscribers/export", editors, h(engage.exportSubscribers));
adminRoutes.delete("/subscribers/:id", editors, h(engage.deleteSubscriber));

// Comments
adminRoutes.get("/comments", h(engage.listComments));
adminRoutes.patch("/comments/:id/status", editors, h(engage.setCommentStatus));
adminRoutes.delete("/comments/:id", editors, h(engage.deleteComment));

// Media library
adminRoutes.post("/media/upload", uploadSingle, h(media.upload));
adminRoutes.post("/media/embed", h(media.addEmbed));
adminRoutes.get("/media", h(media.list));
adminRoutes.patch("/media/:id", h(media.update));
adminRoutes.delete("/media/:id", editors, h(media.remove));

// Dashboard
adminRoutes.get("/dashboard/overview", h(analytics.overview));
adminRoutes.get("/dashboard/analytics", h(analytics.analytics));
adminRoutes.get("/activity", h(analytics.activity));

// Users
adminRoutes.get("/users", superadmin, h(users.list));
adminRoutes.post("/users", superadmin, h(users.create));
adminRoutes.delete("/users/:id", superadmin, h(users.remove));

// Content collections: /admin/articles, /admin/books, /admin/projects, ...
for (const def of Object.values(resources)) {
  const r = Router();
  r.get("/", h(content.adminList(def)));
  r.get("/:id", h(content.adminGet(def)));
  r.post("/", h(content.adminCreate(def)));
  r.put("/:id", h(content.adminUpdate(def)));
  r.delete("/:id", h(content.adminDelete(def)));
  adminRoutes.use(`/${def.name}`, r);
}
