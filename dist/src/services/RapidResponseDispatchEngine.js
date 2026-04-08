"use strict";
// src/services/RapidResponseDispatchEngine.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.RapidResponseDispatchEngine = void 0;
class RapidResponseDispatchEngine {
    constructor(getAvailableOperators) {
        this.getAvailableOperators = getAvailableOperators;
    }
    async dispatch(taskType, context) {
        const operators = await this.getAvailableOperators();
        if (!operators.length)
            return null;
        const priorityScore = this.computePriorityScore(context);
        const scored = operators
            .filter(op => op.status === "AVAILABLE")
            .map(op => ({
            operator: op,
            score: this.scoreOperator(op, taskType, priorityScore),
        }))
            .sort((a, b) => b.score - a.score);
        if (!scored.length)
            return null;
        const best = scored[0];
        return {
            operatorId: best.operator.id,
            priorityScore: best.score,
            reason: `Selected based on tier, performance, and proximity for priority=${priorityScore}`,
        };
    }
    computePriorityScore(context) {
        const contract = context.contractPriority ?? 1;
        const vendor = context.vendorRisk ?? 1;
        const urgency = context.operationalUrgency ?? 1;
        return contract * 3 + vendor * 2 + urgency * 4;
    }
    scoreOperator(operator, taskType, priorityScore) {
        const tierWeight = this.tierWeight(operator.tier);
        const performanceWeight = operator.performanceScore / 100;
        const proximityWeight = 1;
        const priorityFactor = priorityScore / 50;
        return (tierWeight * 3 * priorityFactor +
            performanceWeight * 4 * priorityFactor +
            proximityWeight * 2);
    }
    tierWeight(tier) {
        switch (tier) {
            case "ELITE":
                return 1.0;
            case "SENIOR":
                return 0.8;
            default:
                return 0.6;
        }
    }
}
exports.RapidResponseDispatchEngine = RapidResponseDispatchEngine;
//# sourceMappingURL=RapidResponseDispatchEngine.js.map