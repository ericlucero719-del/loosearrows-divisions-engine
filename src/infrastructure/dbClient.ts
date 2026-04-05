// src/infrastructure/dbClient.ts
// Wraps the Prisma client with logger injection and a clean connect/disconnect lifecycle.

import { PrismaClient } from "@prisma/client";
import { Logger } from "./logger";

export interface DbClient extends PrismaClient {}

export async function createDbClient({ logger }: { logger: Logger }): Promise<DbClient> {
  const prisma = new PrismaClient({
    log: [
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" },
    ],
  });

  (prisma as any).$on("error", (e: any) => {
    logger.error("Prisma error", { message: e.message, target: e.target });
  });

  (prisma as any).$on("warn", (e: any) => {
    logger.warn("Prisma warning", { message: e.message });
  });

  await prisma.$connect();
  logger.info("Database connected");

  return prisma as DbClient;
}
