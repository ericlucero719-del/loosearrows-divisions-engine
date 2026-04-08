import { PrismaClient } from "@prisma/client";
import { Logger } from "./logger";
export interface DbClient extends PrismaClient {
}
export declare function createDbClient({ logger }: {
    logger: Logger;
}): Promise<DbClient>;
//# sourceMappingURL=dbClient.d.ts.map