import { PurchaseOrderRequest, PoEngineResult, SupplierMatchResult } from "../types";
export interface PoEngineOptions {
    enableLogging?: boolean;
    logger?: (message: string, meta?: unknown) => void;
}
export declare class PurchaseOrderEngine {
    private logs;
    private options;
    constructor(options?: PoEngineOptions);
    getLogs(): {
        timestamp: string;
        message: string;
        meta?: unknown;
    }[];
    private log;
    createPurchaseOrder(match: SupplierMatchResult, request: PurchaseOrderRequest): Promise<PoEngineResult>;
}
//# sourceMappingURL=poEngine.d.ts.map