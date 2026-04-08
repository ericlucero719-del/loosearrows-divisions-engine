import { RapidResponseEvent } from "../models/RapidResponseEvent";
import { PerformanceEngine } from "./PerformanceEngine";
interface AuditWriter {
    record(event: RapidResponseEvent): Promise<void>;
}
interface AnalyticsEngine {
    ingestFieldEvent(event: RapidResponseEvent): Promise<void>;
}
interface ContractEngine {
    alignFieldEvent(event: RapidResponseEvent): Promise<void>;
}
interface VendorEngine {
    updateFromFieldEvent(event: RapidResponseEvent): Promise<void>;
}
interface LogisticsEngine {
    confirmFieldAction(event: RapidResponseEvent): Promise<void>;
}
export declare class RapidResponseHandler {
    private auditWriter;
    private analytics;
    private contractEngine;
    private vendorEngine;
    private logisticsEngine;
    private performanceEngine;
    constructor(auditWriter: AuditWriter, analytics: AnalyticsEngine, contractEngine: ContractEngine, vendorEngine: VendorEngine, logisticsEngine: LogisticsEngine, performanceEngine: PerformanceEngine);
    handle(event: RapidResponseEvent): Promise<{
        status: string;
        eventId: string;
    }>;
    private validateForgeMark;
}
export {};
//# sourceMappingURL=RapidResponseHandler.d.ts.map