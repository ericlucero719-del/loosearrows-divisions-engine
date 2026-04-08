import { WorkRequest, RequestType, RequestStatus, Bid, BidStatus, BidLineItem } from "./division3.types";
export declare class Division3Service {
    createRequest(data: {
        type: RequestType;
        requestorId: string;
        notes?: string;
    }): Promise<WorkRequest>;
    attachProducts(id: string, productIds: string[]): Promise<WorkRequest | null>;
    linkContract(id: string, contractId: string): Promise<WorkRequest | null>;
    updateStatus(id: string, status: RequestStatus): Promise<WorkRequest | null>;
    listRequests(): Promise<WorkRequest[]>;
    getRequest(id: string): Promise<WorkRequest | null>;
    getBidPipeline(): Promise<{
        contract: any;
        existingBidCount: number;
    }[]>;
    createBid(data: {
        contractId: string;
        vendorId: string;
        vendorName?: string;
        requestId?: string;
        lineItems?: Omit<BidLineItem, "extended">[];
        notes?: string;
        bidRef?: string;
    }): Promise<Bid | {
        error: string;
    }>;
    listBids(status?: BidStatus): Promise<Bid[]>;
    getBid(bidId: string): Promise<(Bid & {
        _contract?: any;
    }) | null>;
    setLineItems(bidId: string, items: Omit<BidLineItem, "extended">[]): Promise<Bid | {
        error: string;
    }>;
    generateQuote(bidId: string): Promise<{
        bid: Bid;
        quote: any;
    } | {
        error: string;
    }>;
    submitBid(bidId: string): Promise<Bid | {
        error: string;
    }>;
    updatePricing(bidId: string, prices: {
        sku: string;
        unitPrice: number;
        quantity?: number;
    }[]): Promise<Bid | {
        error: string;
    }>;
    updateBidStatus(bidId: string, status: BidStatus): Promise<Bid | {
        error: string;
    }>;
}
export declare const division3Service: Division3Service;
//# sourceMappingURL=division3.service.d.ts.map