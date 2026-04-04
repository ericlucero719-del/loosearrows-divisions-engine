// modules/division6/division6.types.ts
// Division 6 — Compliance & Documentation

export type ComplianceStatus = "Pending" | "In Progress" | "Compliant" | "Non-Compliant";
export type EntityType = "contract" | "request" | "shipment" | "vendor";

export interface AttachedDocument {
  documentId: string;
  name: string;
  url?: string;
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
