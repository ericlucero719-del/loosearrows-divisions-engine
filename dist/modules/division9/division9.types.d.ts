export type QuoteStatus = "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
export type InvoiceStatus = "Unpaid" | "Partial" | "Paid" | "Voided";
export interface QuoteLineItem {
    sku: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    extended: number;
}
export interface Quote {
    id: string;
    quoteRef?: string;
    requestId?: string;
    contractId?: string;
    lineItems: QuoteLineItem[];
    totalAmount: number;
    status: QuoteStatus;
    createdAt: string;
    updatedAt: string;
}
export interface Invoice {
    id: string;
    invoiceRef?: string;
    quoteId: string;
    quoteRef?: string;
    requestId?: string;
    contractId?: string;
    billingAddress?: string;
    totalAmount: number;
    paidAmount: number;
    status: InvoiceStatus;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=division9.types.d.ts.map