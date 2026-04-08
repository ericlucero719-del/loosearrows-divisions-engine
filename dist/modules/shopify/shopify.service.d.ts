export declare const shopifyService: {
    syncOrders(limit?: number): Promise<{
        synced: number;
        skipped: number;
        errors: string[];
    }>;
    syncOne(shopifyOrderId: string): Promise<{
        status: string;
        platform: string;
        order_id: string;
        internalId: any;
        profitPreview: string;
        skuMatch: {
            sku: string;
            name: any;
            cost: any;
            price: any;
            marginPct: any;
            matched: boolean;
        }[];
        vendor: string;
        compliance: {
            passed: boolean;
            activeDocCount: any;
            missingTypes: string[];
        };
        po: {
            poRef: any;
            status: any;
            totalValue: any;
        };
    }>;
    processWebhook(topic: string, body: any): Promise<{
        status: string;
        platform: string;
        order_id: string;
        internalId: any;
        profitPreview: string;
        skuMatch: {
            sku: string;
            name: any;
            cost: any;
            price: any;
            marginPct: any;
            matched: boolean;
        }[];
        vendor: string;
        compliance: {
            passed: boolean;
            activeDocCount: any;
            missingTypes: string[];
        };
        po: {
            poRef: any;
            status: any;
            totalValue: any;
        };
    } | {
        status: string;
        reason: string;
        externalId?: undefined;
        topic?: undefined;
    } | {
        status: string;
        externalId: string;
        reason?: undefined;
        topic?: undefined;
    } | {
        status: string;
        topic: string;
        reason?: undefined;
        externalId?: undefined;
    }>;
    summary(): Promise<{
        platform: string;
        totalOrders: any;
        paidOrders: any;
        totalRevenue: number;
        totalProfit: number;
        byStatus: Record<string, number>;
    }>;
    listOrders(status?: string): Promise<any>;
    getOrder(orderId: string): Promise<any>;
    storeInfo(): Promise<{
        name: any;
        domain: any;
        email: any;
        currency: any;
        plan: any;
    }>;
};
//# sourceMappingURL=shopify.service.d.ts.map