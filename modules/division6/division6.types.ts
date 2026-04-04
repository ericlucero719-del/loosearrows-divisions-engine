// modules/division6/division6.types.ts
// Division 6 — Compliance & Documentation

export type ComplianceStatus = "Pending" | "In Progress" | "Compliant" | "Non-Compliant";
// Accept both cased variants from callers
export type EntityType = "contract" | "Contract" | "request" | "Request" | "shipment" | "Shipment" | "vendor" | "Vendor";

export interface AttachedDocument {
  documentId: string;
  name: string;
  url?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  attachedAt: string;
}

export interface ComplianceRequirement {
  id: string;
  entityType: EntityType;
  entityId: string;
  documentType: string;
  status: ComplianceStatus;
  attachedDocuments: AttachedDocument[];
  createdAt: string;
  updatedAt: string;
}
