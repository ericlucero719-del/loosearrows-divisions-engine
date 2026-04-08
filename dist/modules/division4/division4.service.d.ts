export declare class Division4Service {
    listPOs(status?: string): Promise<{
        poId: any;
        poRef: any;
        bidId: any;
        contractId: any;
        vendorId: any;
        vendorName: any;
        agencyName: any;
        status: any;
        totalValue: any;
        notes: any;
        lineItems: any;
        shipments: any;
        invoices: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    getPO(poId: string): Promise<{
        poId: any;
        poRef: any;
        bidId: any;
        contractId: any;
        vendorId: any;
        vendorName: any;
        agencyName: any;
        status: any;
        totalValue: any;
        notes: any;
        lineItems: any;
        shipments: any;
        invoices: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    createPO(data: {
        vendorId?: string;
        vendorName?: string;
        agencyName?: string;
        bidId?: string;
        contractId?: string;
        notes?: string;
        lineItems?: Array<{
            sku: string;
            clin?: string;
            description?: string;
            quantity: number;
            unitPrice: number;
        }>;
    }): Promise<{
        poId: any;
        poRef: any;
        bidId: any;
        contractId: any;
        vendorId: any;
        vendorName: any;
        agencyName: any;
        status: any;
        totalValue: any;
        notes: any;
        lineItems: any;
        shipments: any;
        invoices: any;
        createdAt: any;
        updatedAt: any;
    }>;
    createPOFromBid(bidId: string): Promise<{
        poId: any;
        poRef: any;
        bidId: any;
        contractId: any;
        vendorId: any;
        vendorName: any;
        agencyName: any;
        status: any;
        totalValue: any;
        notes: any;
        lineItems: any;
        shipments: any;
        invoices: any;
        createdAt: any;
        updatedAt: any;
    }>;
    updateStatus(poId: string, status: string, notes?: string): Promise<{
        poId: any;
        poRef: any;
        bidId: any;
        contractId: any;
        vendorId: any;
        vendorName: any;
        agencyName: any;
        status: any;
        totalValue: any;
        notes: any;
        lineItems: any;
        shipments: any;
        invoices: any;
        createdAt: any;
        updatedAt: any;
    }>;
    inventorySummary(): Promise<{
        sku: string;
        totalQuantity: number;
        totalValue: number;
    }[]>;
}
export declare const division4Service: Division4Service;
//# sourceMappingURL=division4.service.d.ts.map