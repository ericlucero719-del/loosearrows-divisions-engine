export interface CommerceItem {
    sku: string;
    quantity: number;
    unitPrice?: number;
    name?: string;
}
export interface CommerceOrderPayload {
    order_id: string;
    items: CommerceItem[];
    channel?: string;
    notes?: string;
}
export interface PlatformConfig {
    platform: string;
    prefix: string;
    label: string;
}
export declare class CommerceService {
    private cfg;
    constructor(cfg: PlatformConfig);
    static forPlatform(cfg: PlatformConfig): CommerceService;
    private pfx;
    captureOrder(payload: CommerceOrderPayload): Promise<{
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
    fulfill(order_id: string, method: string, carrier?: string, trackingRef?: string): Promise<{
        labelRef?: string | undefined;
        trackingRef?: string | undefined;
        status: string;
        platform: string;
        order_id: string;
        method: string;
    }>;
    invoice(order_id: string): Promise<{
        status: string;
        platform: string;
        order_id: string;
        invoiceRef: any;
        totalAmount: any;
        dueDate: string;
    }>;
    recordPayment(order_id: string): Promise<{
        status: string;
        platform: string;
        order_id: string;
        invoiceRef: any;
        amount: any;
    }>;
    notify(order_id: string, event: string): Promise<{
        status: string;
        platform: string;
        order_id: string;
        event: string;
    }>;
    listOrders(status?: string): Promise<any>;
    getOrder(order_id: string): Promise<any>;
    summary(): Promise<{
        platform: string;
        totalOrders: any;
        paidOrders: any;
        totalRevenue: number;
        totalProfit: number;
        byStatus: Record<string, number>;
    }>;
    static allPlatformsSummary(): Promise<{
        totalOrders: number;
        totalRevenue: number;
        totalProfit: number;
        byPlatform: {
            [k: string]: {
                revenue: number;
                profit: number;
                orders: number;
                byStatus: Record<string, number>;
            };
        };
    }>;
}
//# sourceMappingURL=commerce.service.d.ts.map