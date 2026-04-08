"use strict";
// src/engines/performanceEngine.ts
// Factory wrapper around the PerformanceEngine class — matches the master.js pattern.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPerformanceEngine = createPerformanceEngine;
const PerformanceEngine_1 = require("../services/PerformanceEngine");
const RapidResponseOperatorService_1 = require("../services/RapidResponseOperatorService");
function createPerformanceEngine({ logger, db, contractData, }) {
    const operatorService = new RapidResponseOperatorService_1.RapidResponseOperatorService();
    const engine = new PerformanceEngine_1.PerformanceEngine(operatorService);
    return {
        async evaluate(event) {
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
//# sourceMappingURL=performanceEngine.js.map