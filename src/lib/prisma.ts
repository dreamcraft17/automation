import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Railway: cert self-signed + opsi SSL (hanya saat DATABASE_URL = Railway)
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

  const adapter = new PrismaPg({
    connectionString,
    ssl: isRailway ? { rejectUnauthorized: false } : undefined,
  });
  return new PrismaClient({ adapter });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
