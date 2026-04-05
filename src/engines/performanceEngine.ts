// src/engines/performanceEngine.ts
// Factory wrapper around the PerformanceEngine class — matches the master.js pattern.

import { Logger } from "../infrastructure/logger";
import { DbClient } from "../infrastructure/dbClient";
import { ContractData } from "../infrastructure/contractDataLoader";
import { PerformanceEngine as PerformanceEngineClass } from "../services/PerformanceEngine";
import { RapidResponseOperatorService } from "../services/RapidResponseOperatorService";
import { RapidResponseEvent } from "../models/RapidResponseEvent";

export interface PerformanceEngineHandle {
  evaluate(event: RapidResponseEvent): Promise<any>;
}

export function createPerformanceEngine({
  logger,
  db,
  contractData,
}: {
  logger: Logger;
  db: DbClient;
  contractData: ContractData;
}): PerformanceEngineHandle {
  const operatorService = new RapidResponseOperatorService();
  const engine = new PerformanceEngineClass(operatorService);

  return {
    async evaluate(event: RapidResponseEvent) {
      const result = await engine.evaluate(event);
      if (result) {
        logger.info("Performance evaluated", {
          operatorId: event.operatorId,
          score: result.performanceScore,
          tier: result.tier,
        });
      }
      return result;
    },
  };
}
