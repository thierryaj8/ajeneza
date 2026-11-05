import type { Request } from "express";
import { prisma } from "../config/db.js";

export async function logActivity(req: Request, action: string, resource: string, resourceId?: string, summary?: string) {
  try {
    await prisma.activityLog.create({ data: { userId: req.user?.id, action, resource, resourceId, summary: summary?.slice(0, 300) } });
  } catch {
    /* activity logging must never break a request */
  }
}
