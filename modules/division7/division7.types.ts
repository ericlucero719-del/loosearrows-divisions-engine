// modules/division7/division7.types.ts
// Division 7 — Vendor & Partner Management

export interface Vendor {
  id: string;
  name: string;
  categories: string[];
  capabilities: string[];
  performanceNotes?: string;
  contactEmail?: string;
  status: "active" | "inactive" | "pending";
  linkedContracts: string[];
  linkedRequests: string[];
  createdAt: string;
}
