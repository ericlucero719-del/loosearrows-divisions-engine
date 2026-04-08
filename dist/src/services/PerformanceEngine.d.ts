import { RapidResponseEvent } from "../models/RapidResponseEvent";
import { RapidResponseOperatorService } from "./RapidResponseOperatorService";
export declare class PerformanceEngine {
    private operatorService;
    constructor(operatorService: RapidResponseOperatorService);
    evaluate(event: RapidResponseEvent): Promise<import("../models/RapidResponseOperator").RapidResponseOperator | null | undefined>;
    private computeScoreDelta;
    private computeTier;
}
//# sourceMappingURL=PerformanceEngine.d.ts.map