export declare function calcFee(contractValue: number, feeRate?: number, minFee?: number, maxFee?: number): number;
export declare const billingService: {
    estimate(contractValue: number, platform?: string): Promise<{
        platform: string;
        contractValue: number;
        feeRate: string;
        feeAmountUsd: number;
        minFeeUsd: any;
        maxFeeUsd: any;
        netToVendor: number;
        looseArrowsRev: number;
    }>;
    getConfig(platform: string): Promise<any>;
    updateConfig(platform: string, feeRate: number, minFeeUsd: number, maxFeeUsd?: number, notes?: string): Promise<any>;
    listConfigs(): Promise<any>;
    revenueReport(): Promise<{
        totalFeeRevenue: number;
        defaultFeeRate: string;
        byPlatform: Record<string, {
            orders: number;
            feeRevenue: number;
        }>;
        projectedAnnual: number;
    }>;
};
//# sourceMappingURL=billing.service.d.ts.map