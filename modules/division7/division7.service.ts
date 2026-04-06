// modules/division7/division7.service.ts
// Division 7 — Vendor & Partner Management (PostgreSQL-backed)

import { PrismaClient } from "@prisma/client";
import { Vendor } from "./division7.types";

const prisma = new PrismaClient();

function toVendor(row: any): Vendor {
  return {
    id:               row.id,
    name:             row.name,
    categories:       JSON.parse(row.categoriesJson   || "[]"),
    capabilities:     JSON.parse(row.capabilitiesJson || "[]"),
    performanceNotes: row.performanceNotes ?? undefined,
    contactEmail:     row.contactEmail     ?? undefined,
    status:           row.status as Vendor["status"],
    linkedContracts:  JSON.parse(row.linkedContractsJson || "[]"),
    linkedRequests:   JSON.parse(row.linkedRequestsJson  || "[]"),
    createdAt:        row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
  };
}

export class Division7Service {
  async createVendor(data: Omit<Vendor, "id" | "linkedContracts" | "linkedRequests" | "createdAt">): Promise<Vendor> {
    const row = await prisma.govVendor.create({
      data: {
        name:                data.name,
        categoriesJson:      JSON.stringify(data.categories   ?? []),
        capabilitiesJson:    JSON.stringify(data.capabilities ?? []),
        performanceNotes:    data.performanceNotes ?? null,
        contactEmail:        data.contactEmail     ?? null,
        status:              data.status ?? "active",
        linkedContractsJson: "[]",
        linkedRequestsJson:  "[]",
      },
    });
    return toVendor(row);
  }

  async listVendors(): Promise<Vendor[]> {
    const rows = await prisma.govVendor.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map(toVendor);
  }

  async getVendor(id: string): Promise<Vendor | null> {
    const row = await prisma.govVendor.findUnique({ where: { id } });
    return row ? toVendor(row) : null;
  }

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | null> {
    const existing = await prisma.govVendor.findUnique({ where: { id } });
    if (!existing) return null;
    const row = await prisma.govVendor.update({
      where: { id },
      data: {
        name:             updates.name             ?? existing.name,
        categoriesJson:   updates.categories       ? JSON.stringify(updates.categories)   : existing.categoriesJson,
        capabilitiesJson: updates.capabilities     ? JSON.stringify(updates.capabilities) : existing.capabilitiesJson,
        performanceNotes: updates.performanceNotes ?? existing.performanceNotes,
        contactEmail:     updates.contactEmail     ?? existing.contactEmail,
        status:           updates.status           ?? existing.status,
      },
    });
    return toVendor(row);
  }

  async attach(id: string, type: "contract" | "request", referenceId: string): Promise<Vendor | null> {
    const existing = await prisma.govVendor.findUnique({ where: { id } });
    if (!existing) return null;

    if (type === "contract") {
      const list: string[] = JSON.parse(existing.linkedContractsJson || "[]");
      if (!list.includes(referenceId)) list.push(referenceId);
      await prisma.govVendor.update({ where: { id }, data: { linkedContractsJson: JSON.stringify(list) } });
    } else {
      const list: string[] = JSON.parse(existing.linkedRequestsJson || "[]");
      if (!list.includes(referenceId)) list.push(referenceId);
      await prisma.govVendor.update({ where: { id }, data: { linkedRequestsJson: JSON.stringify(list) } });
    }

    const updated = await prisma.govVendor.findUnique({ where: { id } });
    return updated ? toVendor(updated) : null;
  }
}

export const division7Service = new Division7Service();
