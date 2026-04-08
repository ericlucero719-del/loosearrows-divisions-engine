export type RequestStatus = "New" | "In Review" | "Quoted" | "Approved" | "Fulfilled" | "Closed";
export type RequestType = "RFQ" | "MicroPurchase" | "Internal";
export interface WorkRequest {
    id: string;
    type: RequestType;
    requestorId: string;
    contractId?: string;
    productIds: string[];
    status: RequestStatus;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
export type BidStatus = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "AWARDED" | "LOST" | "WITHDRAWN";
export interface BidLineItem {
    sku: string;
    clin?: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    extended: number;
}
export interface Bid {
    bidId: string;
    bidRef?: string;
    contractId: string;
    requestId?: string;
    vendorId: string;
    vendorName?: string;
    status: BidStatus;
    lineItems: BidLineItem[];
    totalValue: number;
    quoteId?: string;
    quoteRef?: string;
    notes?: string;
    submittedAt?: string;
    awardedAt?: string;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=division3.types.d.ts.map