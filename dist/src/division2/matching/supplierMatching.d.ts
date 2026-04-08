import { SupplierMatchInput, SupplierMatchResult, SupplierMatchFailure, SupplierInput } from "../types";
export type SupplierAttemptFn<T> = (supplier: SupplierInput) => Promise<T>;
export declare function matchSupplier<T>(input: SupplierMatchInput, attempt: SupplierAttemptFn<T>, options?: {
    maxRetries?: number;
}): Promise<{
    result?: SupplierMatchResult;
    failure?: SupplierMatchFailure;
    attemptResult?: T;
}>;
//# sourceMappingURL=supplierMatching.d.ts.map