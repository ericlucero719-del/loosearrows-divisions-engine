import { Logger } from "../infrastructure/logger";
import { DbClient } from "../infrastructure/dbClient";
import { ContractData } from "../infrastructure/contractDataLoader";
import { RapidResponseEvent } from "../models/RapidResponseEvent";
export interface PerformanceEngineHandle {
    evaluate(event: RapidResponseEvent): Promise<any>;
}
export declare function createPerformanceEngine({ logger, db, contractData, }: {
    logger: Logger;
    db: DbClient;
    contractData: ContractData;
}): PerformanceEngineHandle;
//# sourceMappingURL=performanceEngine.d.ts.map