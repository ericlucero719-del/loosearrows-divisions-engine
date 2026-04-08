"use strict";
// modules/division7/division7.service.ts
// Division 7 — Vendor & Partner Management (PostgreSQL-backed)
Object.defineProperty(exports, "__esModule", { value: true });
exports.division7Service = exports.Division7Service = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function toVendor(row) {
    return {
        id: row.id,
        name: row.name,
        categories: JSON.parse(row.categoriesJson || "[]"),
        capabilities: JSON.parse(row.capabilitiesJson || "[]"),
        performanceNotes: row.performanceNotes ?? undefined,
        contactEmail: row.contactEmail ?? undefined,
        status: row.status,
        linkedContracts: JSON.parse(row.linkedContractsJson || "[]"),
        linkedRequests: JSON.parse(row.linkedRequestsJson || "[]"),
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    };
}
class Division7Service {
    async createVendor(data) {
        const row = await prisma.govVendor.create({
            data: {
                name: data.name,
                categoriesJson: JSON.stringify(data.categories ?? []),
                capabilitiesJson: JSON.stringify(data.capabilities ?? []),
                performanceNotes: data.performanceNotes ?? null,
                contactEmail: data.contactEmail ?? null,
                status: data.status ?? "active",
                linkedContractsJson: "[]",
                linkedRequestsJson: "[]",
            },
        });
        return toVendor(row);
    }
    async listVendors() {
        const rows = await prisma.govVendor.findMany({ orderBy: { createdAt: "asc" } });
        return rows.map(toVendor);
    }
    async getVendor(id) {
        const row = await prisma.govVendor.findUnique({ where: { id } });
        return row ? toVendor(row) : null;
    }
    async updateVendor(id, updates) {
        const existing = await prisma.govVendor.findUnique({ where: { id } });
        if (!existing)
            return null;
        const row = await prisma.govVendor.update({
            where: { id },
            data: {
                name: updates.name ?? existing.name,
                categoriesJson: updates.categories ? JSON.stringify(updates.categories) : existing.categoriesJson,
                capabilitiesJson: updates.capabilities ? JSON.stringify(updates.capabilities) : existing.capabilitiesJson,
                performanceNotes: updates.performanceNotes ?? existing.performanceNotes,
                contactEmail: updates.contactEmail ?? existing.contactEmail,
                status: updates.status ?? existing.status,
            },
        });
        return toVendor(row);
    }
    async attach(id, type, referenceId) {
        const existing = await prisma.govVendor.findUnique({ where: { id } });
        if (!existing)
            return null;
        if (type === "contract") {
            const list = JSON.parse(existing.linkedContractsJson || "[]");
            if (!list.includes(referenceId))
                list.push(referenceId);
            await prisma.govVendor.update({ where: { id }, data: { linkedContractsJson: JSON.stringify(list) } });
        }
        else {
            const list = JSON.parse(existing.linkedRequestsJson || "[]");
            if (!list.includes(referenceId))
                list.push(referenceId);
            await prisma.govVendor.update({ where: { id }, data: { linkedRequestsJson: JSON.stringify(list) } });
        }
        const updated = await prisma.govVendor.findUnique({ where: { id } });
        return updated ? toVendor(updated) : null;
    }
}
exports.Division7Service = Division7Service;
exports.division7Service = new Division7Service();
//# sourceMappingURL=division7.service.js.map