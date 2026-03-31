// src/services/PerformanceEngine.ts

import { RapidResponseEvent } from "../models/RapidResponseEvent";
import { RapidResponseOperatorService } from "./RapidResponseOperatorService";

export class PerformanceEngine {
  constructor(private operatorService: RapidResponseOperatorService) {}

  async evaluate(event: RapidResponseEvent) {
    const operators = this.operatorService.getAll();
    const operator = operators.find(op => op.id === event.operatorId);
    if (!operator) return;

    const scoreDelta = this.computeScoreDelta(event);
    const newScore = Math.max(0, Math.min(100, operator.performanceScore + scoreDelta));

    const updated = this.operatorService.update(operator.id, {
      performanceScore: newScore,
      tier: this.computeTier(newScore)
    });

    return updated;
  }

  private computeScoreDelta(event: RapidResponseEvent): number {
    let delta = 0;

    if (event.payload?.completed === true) delta += 5;
    if (event.payload?.onTime === true) delta += 5;
    if (event.payload?.accuracy === "HIGH") delta += 5;
    if (event.payload?.accuracy === "LOW") delta -= 5;
    if (event.payload?.missingData === true) delta -= 3;
    if (event.payload?.escalated === true) delta -= 2;

    return delta;
  }

  private computeTier(score: number) {
    if (score >= 90) return "ELITE";
    if (score >= 70) return "SENIOR";
    return "STANDARD";
  }
}
