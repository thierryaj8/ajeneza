import rateLimit from "express-rate-limit";
import { config } from "../config/env.js";

const opts = { standardHeaders: "draft-7" as const, legacyHeaders: false };
const n = (limit: number) => (config.isTest ? 100_000 : limit);

/** Whole API: generous ceiling per IP. */
export const apiLimiter = rateLimit({ ...opts, windowMs: 15 * 60 * 1000, limit: n(600) });
/** Sign-in attempts. */
export const loginLimiter = rateLimit({ ...opts, windowMs: 15 * 60 * 1000, limit: n(10), message: { error: "Too many login attempts. Please wait 15 minutes." } });
/** Contact form, newsletter and comments (spam protection). */
export const formLimiter = rateLimit({ ...opts, windowMs: 60 * 60 * 1000, limit: n(8), message: { error: "Too many submissions. Please try again later." } });
/** Analytics beacon. */
export const trackLimiter = rateLimit({ ...opts, windowMs: 60 * 1000, limit: n(60) });
