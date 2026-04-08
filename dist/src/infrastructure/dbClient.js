"use strict";
// src/infrastructure/dbClient.ts
// Wraps the Prisma client with logger injection and a clean connect/disconnect lifecycle.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDbClient = createDbClient;
const client_1 = require("@prisma/client");
async function createDbClient({ logger }) {
    const prisma = new client_1.PrismaClient({
        log: [
            { emit: "event", level: "error" },
            { emit: "event", level: "warn" },
        ],
    });
    prisma.$on("error", (e) => {
        logger.error("Prisma error", { message: e.message, target: e.target });
    });
    prisma.$on("warn", (e) => {
        logger.warn("Prisma warning", { message: e.message });
    });
    await prisma.$connect();
    logger.info("Database connected");
    return prisma;
}
//# sourceMappingURL=dbClient.js.map