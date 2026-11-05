import { Router } from "express";
import * as auth from "../controllers/auth.controller.js";
import { requireAuth, requireCsrfHeader } from "../middleware/auth.middleware.js";
import { loginLimiter } from "../middleware/rateLimit.middleware.js";
import { asyncHandler as h } from "../utils/http.js";

export const authRoutes = Router();
authRoutes.use(requireCsrfHeader);

authRoutes.post("/login", loginLimiter, h(auth.login));
authRoutes.post("/refresh", h(auth.refresh));
authRoutes.post("/logout", h(auth.logout));
authRoutes.get("/me", requireAuth, h(auth.me));
authRoutes.put("/password", requireAuth, h(auth.changePassword));
