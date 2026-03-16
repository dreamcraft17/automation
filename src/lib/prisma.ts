import pg from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient; prismaPool?: pg.Pool };

// Railway pakai cert self-signed: biarkan Node terima (hanya saat DATABASE_URL = Railway)
if (typeof process !== "undefined" && process.env.DATABASE_URL?.includes("rlwy.net")) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

function createPrismaClient() {
  const url =
    process.env.DATABASE_URL ||
    "postgresql://localhost:5432/insightflow?schema=public";

  const isRailway = url.includes("rlwy.net");
  const connectionString = isRailway
    ? url.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?&/, "?").replace(/\?$/, "")
    : url;

  const pool =
    globalForPrisma.prismaPool ??
    new pg.Pool({
      connectionString,
      ssl: isRailway ? { rejectUnauthorized: false } : undefined,
    });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prismaPool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
