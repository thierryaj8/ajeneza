import { Router } from "express";
import { apiLimiter } from "../middleware/rateLimit.middleware.js";
import { adminRoutes } from "./admin.routes.js";
import { authRoutes } from "./auth.routes.js";
import { publicRoutes } from "./public.routes.js";

/** Everything mounted under /api/v1 */
export const apiRouter = Router();
apiRouter.use(apiLimiter);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/", publicRoutes);
