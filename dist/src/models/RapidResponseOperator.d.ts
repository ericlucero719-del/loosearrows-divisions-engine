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
    role?: string;
    relicsCreated?: number;
    authorityLevel?: number;
}
//# sourceMappingURL=RapidResponseOperator.d.ts.map