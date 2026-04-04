// modules/division6/division6.service.ts
// Division 6 — Compliance & Documentation

import { randomUUID } from "crypto";
import { registry } from "../../src/core/engine";
import { ComplianceRequirement, EntityType, AttachedDocument } from "./division6.types";

export class Division6Service {
  createRequirement(data: {
    entityType: EntityType;
    entityId: string;
    documentType: string;
  }): ComplianceRequirement {
    const now = new Date().toISOString();
    const req: ComplianceRequirement = {
      id: randomUUID(),
      entityType: data.entityType,
      entityId: data.entityId,
      documentType: data.documentType,
      status: "Pending",
      attachedDocuments: [],
      createdAt: now,
      updatedAt: now,
    };
    registry.compliance[req.id] = req;
    return req;
  }

  attachDocument(id: string, doc: { name: string; url?: string; uploadedBy?: string; uploadedAt?: string }): ComplianceRequirement | null {
    const req = registry.compliance[id] as ComplianceRequirement;
    if (!req) return null;

    const attachment: AttachedDocument = {
      documentId: randomUUID(),
      name: doc.name,
      url: doc.url,
      uploadedBy: doc.uploadedBy,
      uploadedAt: doc.uploadedAt,
      attachedAt: new Date().toISOString(),
    };

    req.attachedDocuments.push(attachment);
    req.status = "In Progress";
    req.updatedAt = new Date().toISOString();
    return req;
  }

  // Attach by entity — finds the first matching requirement automatically
  attachDocumentByEntity(
    entityType: string,
    entityId: string,
    doc: { name: string; url?: string; uploadedBy?: string; uploadedAt?: string }
  ): ComplianceRequirement | null {
    const match = Object.values(registry.compliance).find(
      (r: any) => r.entityId === entityId && r.entityType.toLowerCase() === entityType.toLowerCase()
    ) as ComplianceRequirement | undefined;
    if (!match) return null;
    return this.attachDocument(match.id, doc);
  }

  listRequirements(filter?: { entityId?: string; entityType?: string }): ComplianceRequirement[] {
    const all = Object.values(registry.compliance) as ComplianceRequirement[];
    if (!filter) return all;
    return all.filter((r) => {
      if (filter.entityId && r.entityId !== filter.entityId) return false;
      if (filter.entityType && r.entityType !== filter.entityType) return false;
      return true;
    });
  }

  getRequirement(id: string): ComplianceRequirement | null {
    return (registry.compliance[id] as ComplianceRequirement) ?? null;
  }
}

export const division6Service = new Division6Service();
