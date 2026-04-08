"use strict";
// src/services/RapidResponseHandler.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.RapidResponseHandler = void 0;
class RapidResponseHandler {
    constructor(auditWriter, analytics, contractEngine, vendorEngine, logisticsEngine, performanceEngine) {
        this.auditWriter = auditWriter;
        this.analytics = analytics;
        this.contractEngine = contractEngine;
        this.vendorEngine = vendorEngine;
        this.logisticsEngine = logisticsEngine;
        this.performanceEngine = performanceEngine;
    }
    async handle(event) {
        this.validateForgeMark(event);
        if (event.relatedContractId) {
            await this.contractEngine.alignFieldEvent(event);
        }
        if (event.relatedVendorId) {
            await this.vendorEngine.updateFromFieldEvent(event);
        }
        if (event.relatedLogisticsId) {
            await this.logisticsEngine.confirmFieldAction(event);
        }
        await this.auditWriter.record(event);
        await this.analytics.ingestFieldEvent(event);
        await this.performanceEngine.evaluate(event);
        return { status: "OK", eventId: event.id };
    }
    validateForgeMark(event) {
        if (!event.forgeMark || event.forgeMark.operatorId !== event.operatorId) {
            const err = new Error("Invalid Forge Mark");
            err.statusCode = 400;
            throw err;
        }
    }
}
exports.RapidResponseHandler = RapidResponseHandler;
//# sourceMappingURL=RapidResponseHandler.js.map