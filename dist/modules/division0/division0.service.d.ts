export declare class Division0Service {
    fullSystemStatus(): Promise<{
        systemName: string;
        version: string;
        generatedAt: string;
        operationalScore: string;
        summary: {
            active: number;
            empty: number;
            total: number;
        };
        divisions: {
            id: number;
            name: string;
            records: number;
            status: string;
        }[];
    }>;
    pipelineSummary(): Promise<{
        generatedAt: string;
        contracts: {
            total: number;
            byStatus: Record<string, number>;
        };
        bids: {
            total: number;
            byStatus: Record<string, number>;
        };
        purchaseOrders: {
            total: any;
            byStatus: Record<string, number>;
        };
        shipments: {
            total: any;
            byStatus: Record<string, number>;
        };
        invoices: {
            total: any;
            byStatus: Record<string, number>;
        };
    }>;
    financialRollup(): Promise<{
        generatedAt: string;
        totalPoValue: number;
        totalInvoiced: number;
        totalPaid: number;
        totalOutstanding: number;
        invoiceCount: any;
        paidCount: any;
    }>;
    vendorRoster(): Promise<{
        id: string;
        name: string;
        status: string;
        categories: any;
        email: string | undefined;
    }[]>;
    contractRoster(): Promise<{
        contractId: string;
        contractRef: string | undefined;
        name: string;
        status: string;
        agency: string;
    }[]>;
    recentActivity(limit?: number): Promise<{
        type: string;
        ref: string;
        status: string;
        at: string;
    }[]>;
}
export declare const division0Service: Division0Service;
//# sourceMappingURL=division0.service.d.ts.map