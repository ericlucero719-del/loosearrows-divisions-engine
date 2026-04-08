import { RapidResponseTaskType } from "../models/RapidResponseEvent";
export type OperatorTier = "ELITE" | "SENIOR" | "STANDARD";
export type OperatorStatus = "AVAILABLE" | "BUSY" | "OFFLINE";
export interface RapidResponseOperator {
    id: string;
    name: string;
    tier: OperatorTier;
    status: OperatorStatus;
    lat: number;
    lng: number;
    performanceScore: number;
}
export interface DispatchContext {
    contractPriority?: number;
    vendorRisk?: number;
    operationalUrgency?: number;
}
export interface DispatchDecision {
    operatorId: string;
    priorityScore: number;
    reason: string;
}
export declare class RapidResponseDispatchEngine {
    private getAvailableOperators;
    constructor(getAvailableOperators: () => Promise<RapidResponseOperator[]>);
    dispatch(taskType: RapidResponseTaskType, context: DispatchContext): Promise<DispatchDecision | null>;
    private computePriorityScore;
    private scoreOperator;
    private tierWeight;
}
//# sourceMappingURL=RapidResponseDispatchEngine.d.ts.map