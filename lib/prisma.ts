import "dotenv/config";
import type { PrismaClient } from "@/generated/prisma/client";
import { createPrismaClient } from "./db.ts";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient(process.env.DATABASE_URL ?? "file:./dev.db");

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
