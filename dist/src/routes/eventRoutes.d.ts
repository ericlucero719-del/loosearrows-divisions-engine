import { Application } from "express";
import { Logger } from "../infrastructure/logger";
import { DbClient } from "../infrastructure/dbClient";
import { ScoringEngine } from "../engines/scoringEngine";
import { PerformanceEngineHandle } from "../engines/performanceEngine";
import { ContractData } from "../infrastructure/contractDataLoader";
export declare function registerEventRoutes({ app, logger, db, scoringEngine, contractData, performanceEngine, }: {
    app: Application;
    logger: Logger;
    db: DbClient;
    scoringEngine: ScoringEngine;
    contractData: ContractData;
    performanceEngine: PerformanceEngineHandle;
}): void;
//# sourceMappingURL=eventRoutes.d.ts.map