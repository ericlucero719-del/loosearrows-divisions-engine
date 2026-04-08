export type ComplianceStatus = "Pending" | "In Progress" | "Compliant" | "Non-Compliant";
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
//# sourceMappingURL=division6.types.d.ts.map