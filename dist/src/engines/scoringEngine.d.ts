import { Logger } from "../infrastructure/logger";
import { DbClient } from "../infrastructure/dbClient";
import { ContractData } from "../infrastructure/contractDataLoader";
import { RapidResponseEvent } from "../models/RapidResponseEvent";
export interface ScoringResult {
    operatorId: string;
    eventId: string;
    delta: number;
    flags: string[];
    contractAligned: boolean;
    timestamp: string;
}
export interface ScoringEngine {
    score(event: RapidResponseEvent): ScoringResult;
}
export declare function createScoringEngine({ logger, db, contractData, }: {
    logger: Logger;
    db: DbClient;
    contractData: ContractData;
}): ScoringEngine;
//# sourceMappingURL=scoringEngine.d.ts.map