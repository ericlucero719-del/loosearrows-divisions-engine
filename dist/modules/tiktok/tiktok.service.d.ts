export interface TikTokItem {
    sku: string;
    quantity: number;
    unitPrice?: number;
    name?: string;
}
export interface OrderPayload {
    order_id: string;
    items: TikTokItem[];
    notes?: string;
}
export declare class TikTokService {
    captureOrder(payload: OrderPayload): Promise<{
        status: string;
        order_id: string;
        internalId: any;
        profitPreview: string;
        skuMatch: {
            sku: string;
            name: string;
            cost: number;
            price: number;
            marginPct: number;
            matched: boolean;
        }[];
        vendor: string;
        compliance: {
            passed: boolean;
            activeDocCount: number;
            missingTypes: string[];
        };
        po: {
            poRef: any;
            status: any;
            totalValue: any;
        };
    }>;
    fulfill(order_id: string, method: string, carrier?: string, trackingRef?: string): Promise<{
        status: string;
        order_id: string;
        method: string;
        labelRef: string;
        trackingRef: string;
    } | {
        status: string;
        order_id: string;
        method: string;
        labelRef?: undefined;
        trackingRef?: undefined;
    }>;
    invoice(order_id: string): Promise<{
        status: string;
        order_id: string;
        invoiceRef: any;
        totalAmount: any;
        dueDate: any;
    }>;
    recordPayment(order_id: string): Promise<{
        status: string;
        order_id: string;
        invoiceRef: any;
        amount: any;
    }>;
    notify(order_id: string, event: string): Promise<{
        status: string;
        order_id: string;
        event: string;
    }>;
    listOrders(status?: string): Promise<any>;
    getOrder(order_id: string): Promise<any>;
    summary(): Promise<{
        totalOrders: any;
        paidOrders: any;
        totalRevenue: number;
        totalProfit: number;
        byStatus: Record<string, number>;
    }>;
}
export declare const tikTokService: TikTokService;
//# sourceMappingURL=tiktok.service.d.ts.map