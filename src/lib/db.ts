import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 requires an explicit driver adapter (no more implicit,
 * engine-managed connections) — see docs/ARCHITECTURE-touq.md #2.1 for the
 * "single source of truth" data-layer rationale this still serves.
 */
function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

/**
 * A single Prisma Client instance per server process.
 * Next.js hot-reloads modules in dev, which would otherwise spawn a new
 * PrismaClient (and a new DB connection pool) on every edit — so the
 * instance is cached on `globalThis` outside of production.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
