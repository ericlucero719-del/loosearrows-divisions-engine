"use strict";
// modules/division8/division8.service.ts
// Division 8 — Agency & Customer Management (PostgreSQL-backed)
Object.defineProperty(exports, "__esModule", { value: true });
exports.division8Service = exports.Division8Service = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const INTERACTION_TYPES = ["NOTE", "AWARD", "BID", "MEETING", "CALL", "EMAIL"];
const CONTACT_ROLES = ["CO", "COR", "KO", "PM", "POC", "OTHER"];
const include = {
    contacts: true,
    interactions: { orderBy: { createdAt: "desc" }, take: 50 },
};
function toAgency(row) {
    return {
        agencyId: row.agencyId,
        name: row.name,
        agencyType: row.agencyType ?? undefined,
        department: row.department ?? undefined,
        naicsCodes: JSON.parse(row.naicsJson || "[]"),
        status: row.status,
        notes: row.notes ?? undefined,
        contacts: (row.contacts ?? []).map(toContact),
        interactions: (row.interactions ?? []).map(toInteraction),
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
        updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
    };
}
function toContact(row) {
    return {
        contactId: row.contactId,
        agencyId: row.agencyId,
        name: row.name,
        title: row.title ?? undefined,
        email: row.email ?? undefined,
        phone: row.phone ?? undefined,
        role: row.role ?? undefined,
        notes: row.notes ?? undefined,
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    };
}
function toInteraction(row) {
    return {
        interactionId: row.interactionId,
        agencyId: row.agencyId,
        type: row.type,
        contractRef: row.contractRef ?? undefined,
        bidRef: row.bidRef ?? undefined,
        summary: row.summary,
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    };
}
class Division8Service {
    async listAgencies(status) {
        const where = status ? { status } : {};
        const rows = await prisma.govAgency.findMany({ where, include, orderBy: { name: "asc" } });
        return rows.map(toAgency);
    }
    async getAgency(agencyId) {
        const row = await prisma.govAgency.findUnique({ where: { agencyId }, include });
        return row ? toAgency(row) : null;
    }
    async createAgency(data) {
        const row = await prisma.govAgency.create({
            data: {
                name: data.name,
                agencyType: data.agencyType,
                department: data.department,
                naicsJson: JSON.stringify(data.naicsCodes ?? []),
                notes: data.notes,
            },
            include,
        });
        return toAgency(row);
    }
    async updateAgency(agencyId, data) {
        const update = { ...data };
        if (data.naicsCodes) {
            update.naicsJson = JSON.stringify(data.naicsCodes);
            delete update.naicsCodes;
        }
        const row = await prisma.govAgency.update({ where: { agencyId }, data: update, include });
        return toAgency(row);
    }
    async addContact(agencyId, data) {
        const exists = await prisma.govAgency.findUnique({ where: { agencyId } });
        if (!exists)
            throw new Error(`Agency ${agencyId} not found`);
        if (data.role && !CONTACT_ROLES.includes(data.role.toUpperCase())) {
            throw new Error(`Invalid role. Valid: ${CONTACT_ROLES.join(", ")}`);
        }
        const row = await prisma.govAgencyContact.create({
            data: { agencyId, ...data, role: data.role?.toUpperCase() },
        });
        return toContact(row);
    }
    async deleteContact(contactId) {
        await prisma.govAgencyContact.delete({ where: { contactId } });
    }
    async addInteraction(agencyId, data) {
        const exists = await prisma.govAgency.findUnique({ where: { agencyId } });
        if (!exists)
            throw new Error(`Agency ${agencyId} not found`);
        const type = data.type.toUpperCase();
        if (!INTERACTION_TYPES.includes(type)) {
            throw new Error(`Invalid type. Valid: ${INTERACTION_TYPES.join(", ")}`);
        }
        const row = await prisma.govAgencyInteraction.create({
            data: { agencyId, type, summary: data.summary, contractRef: data.contractRef, bidRef: data.bidRef },
        });
        return toInteraction(row);
    }
    async agencySummary() {
        const [total, federal, tribal] = await Promise.all([
            prisma.govAgency.count(),
            prisma.govAgency.count({ where: { agencyType: "FEDERAL" } }),
            prisma.govAgency.count({ where: { agencyType: "TRIBAL" } }),
        ]);
        const contacts = await prisma.govAgencyContact.count();
        const interactions = await prisma.govAgencyInteraction.count();
        return { totalAgencies: total, federal, tribal, contacts, interactions };
    }
    contactRoles() { return CONTACT_ROLES; }
    interactionTypes() { return INTERACTION_TYPES; }
}
exports.Division8Service = Division8Service;
exports.division8Service = new Division8Service();
//# sourceMappingURL=division8.service.js.map