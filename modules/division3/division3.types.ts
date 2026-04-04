// modules/division3/division3.types.ts
// Division 3 — Requests & Work Orders

export type RequestStatus =
  | "New"
  | "In Review"
  | "Quoted"
  | "Approved"
  | "Fulfilled"
  | "Closed";

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
