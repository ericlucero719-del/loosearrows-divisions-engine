"use strict";
// src/services/PerformanceEngine.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceEngine = void 0;
class PerformanceEngine {
    constructor(operatorService) {
        this.operatorService = operatorService;
    }
    async evaluate(event) {
        const operators = this.operatorService.getAll();
        const operator = operators.find(op => op.id === event.operatorId);
        if (!operator)
            return;
        const scoreDelta = this.computeScoreDelta(event);
        const newScore = Math.max(0, Math.min(100, operator.performanceScore + scoreDelta));
        const updated = this.operatorService.update(operator.id, {
            performanceScore: newScore,
            tier: this.computeTier(newScore)
        });
        return updated;
    }
    computeScoreDelta(event) {
        let delta = 0;
        if (event.payload?.completed === true)
            delta += 5;
        if (event.payload?.onTime === true)
            delta += 5;
        if (event.payload?.accuracy === "HIGH")
            delta += 5;
        if (event.payload?.accuracy === "LOW")
            delta -= 5;
        if (event.payload?.missingData === true)
            delta -= 3;
        if (event.payload?.escalated === true)
            delta -= 2;
        return delta;
    }
    computeTier(score) {
        if (score >= 90)
            return "ELITE";
        if (score >= 70)
            return "SENIOR";
        return "STANDARD";
    }
}
exports.PerformanceEngine = PerformanceEngine;
//# sourceMappingURL=PerformanceEngine.js.map