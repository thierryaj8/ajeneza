import { PrismaClient } from "@prisma/client";
import { config } from "./env.js";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: config.databaseUrl });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function connectDb() {
  await prisma.$connect();
  return prisma;
}
