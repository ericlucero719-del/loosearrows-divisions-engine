// src/engines/scoringEngine.ts
// Scores operator events against contract alignment and field accuracy.

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

export function createScoringEngine({
  logger,
  db,
  contractData,
}: {
  logger: Logger;
  db: DbClient;
  contractData: ContractData;
}): ScoringEngine {
  function score(event: RapidResponseEvent): ScoringResult {
    const flags: string[] = [];
    let delta = 0;

    // Completion bonus
    if (event.payload?.completed === true) { delta += 5; flags.push("COMPLETED"); }
    // On-time bonus
    if (event.payload?.onTime === true)     { delta += 5; flags.push("ON_TIME"); }
    // Accuracy modifiers
    if (event.payload?.accuracy === "HIGH") { delta += 5; flags.push("HIGH_ACCURACY"); }
    if (event.payload?.accuracy === "LOW")  { delta -= 5; flags.push("LOW_ACCURACY"); }
    // Quality penalties
    if (event.payload?.missingData === true)  { delta -= 3; flags.push("MISSING_DATA"); }
    if (event.payload?.escalated === true)    { delta -= 2; flags.push("ESCALATED"); }

    // Contract alignment check — bonus if event references a known contract
    const contractAligned = !!(
      event.relatedContractId &&
      contractData.contracts[event.relatedContractId]
    );
    if (contractAligned) { delta += 3; flags.push("CONTRACT_ALIGNED"); }

    // CLIN alignment check
    if (event.payload?.clin && contractData.clins.includes(event.payload.clin)) {
      delta += 2;
      flags.push("CLIN_MATCHED");
    }

    const result: ScoringResult = {
      operatorId:      event.operatorId,
      eventId:         event.id,
      delta,
      flags,
      contractAligned,
      timestamp:       new Date().toISOString(),
    };

    logger.info("Event scored", { operatorId: result.operatorId, delta, flags });
    return result;
  }

  return { score };
}
