// modules/division3/division3.types.ts
// Division 3 — Requests, Work Orders & Bid Pipeline

// ── Work Requests ──────────────────────────────────────────────────────────────
export type RequestStatus =
  | "New"
  | "In Review"
  | "Quoted"
  | "Approved"
  | "Fulfilled"
  | "Closed";

export type RequestType = "RFQ" | "MicroPurchase" | "Internal";

export interface WorkRequest {
  id:          string;
  type:        RequestType;
  requestorId: string;
  contractId?: string;
  productIds:  string[];
  status:      RequestStatus;
  notes?:      string;
  createdAt:   string;
  updatedAt:   string;
}

// ── Bid Pipeline ───────────────────────────────────────────────────────────────
export type BidStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "AWARDED"
  | "LOST"
  | "WITHDRAWN";

export interface BidLineItem {
  sku:          string;
  clin?:        string;
  description?: string;
  quantity:     number;
  unitPrice:    number;
  extended:     number;  // computed: quantity × unitPrice
}

export interface Bid {
  bidId:        string;
  bidRef?:      string;        // human-readable e.g. "BID-001"
  contractId:   string;        // Division 2 contract being bid on
  requestId?:   string;        // optional link to a Division 3 WorkRequest
  vendorId:     string;
  vendorName?:  string;
  status:       BidStatus;
  lineItems:    BidLineItem[];
  totalValue:   number;
  quoteId?:     string;        // Division 9 quote generated from this bid
  quoteRef?:    string;
  notes?:       string;
  submittedAt?: string;
  awardedAt?:   string;
  createdAt:    string;
  updatedAt:    string;
}
