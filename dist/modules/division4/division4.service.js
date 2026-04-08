"use strict";
// modules/division4/division4.service.ts
// Division 4 — Purchase Orders & Inventory (PostgreSQL-backed)
Object.defineProperty(exports, "__esModule", { value: true });
exports.division4Service = exports.Division4Service = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function nextPORef() {
    const count = await prisma.govPO.count();
    return `PO-${String(count + 1).padStart(3, "0")}`;
}
function toPO(row) {
    return {
        poId: row.poId,
        poRef: row.poRef,
        bidId: row.bidId ?? undefined,
        contractId: row.contractId ?? undefined,
        vendorId: row.vendorId ?? undefined,
        vendorName: row.vendorName ?? undefined,
        agencyName: row.agencyName ?? undefined,
        status: row.status,
        totalValue: row.totalValue,
        notes: row.notes ?? undefined,
        lineItems: (row.lineItems ?? []).map((li) => ({
            id: li.id,
            sku: li.sku,
            clin: li.clin ?? undefined,
            description: li.description ?? undefined,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            extended: li.extended,
        })),
        shipments: (row.shipments ?? []).map((s) => ({
            shipmentId: s.shipmentId,
            shipRef: s.shipRef,
            status: s.status,
        })),
        invoices: (row.invoices ?? []).map((inv) => ({
            invoiceId: inv.invoiceId,
            invoiceRef: inv.invoiceRef,
            status: inv.status,
        })),
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
        updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
    };
}
const include = {
    lineItems: true,
    shipments: { select: { shipmentId: true, shipRef: true, status: true } },
    invoices: { select: { invoiceId: true, invoiceRef: true, status: true } },
};
class Division4Service {
    async listPOs(status) {
        const where = status ? { status } : {};
        const rows = await prisma.govPO.findMany({ where, include, orderBy: { createdAt: "desc" } });
        return rows.map(toPO);
    }
    async getPO(poId) {
        const row = await prisma.govPO.findUnique({ where: { poId }, include });
        return row ? toPO(row) : null;
    }
    async createPO(data) {
        const poRef = await nextPORef();
        const items = (data.lineItems ?? []).map(li => ({
            ...li,
            extended: li.quantity * li.unitPrice,
        }));
        const totalValue = items.reduce((s, i) => s + i.extended, 0);
        const row = await prisma.govPO.create({
            data: {
                poRef,
                bidId: data.bidId,
                contractId: data.contractId,
                vendorId: data.vendorId,
                vendorName: data.vendorName,
                agencyName: data.agencyName,
                notes: data.notes,
                totalValue,
                lineItems: { create: items },
            },
            include,
        });
        return toPO(row);
    }
    async createPOFromBid(bidId) {
        const bid = await prisma.govBid.findUnique({
            where: { bidId },
            include: { lineItems: true, contract: true },
        });
        if (!bid)
            throw new Error(`Bid ${bidId} not found`);
        if (bid.status !== "AWARDED")
            throw new Error(`Bid ${bidId} is not AWARDED (status: ${bid.status})`);
        const items = bid.lineItems.map(li => ({
            sku: li.sku,
            clin: li.clin ?? undefined,
            description: li.description ?? undefined,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            extended: li.extended,
        }));
        return this.createPO({
            vendorId: bid.vendorId,
            vendorName: bid.vendorName ?? undefined,
            agencyName: bid.contract.agency,
            bidId: bid.bidId,
            contractId: bid.contractId,
            notes: `Auto-generated from ${bid.bidRef ?? bid.bidId}`,
            lineItems: items,
        });
    }
    async updateStatus(poId, status, notes) {
        const allowed = ["DRAFT", "SENT", "ACKNOWLEDGED", "FULFILLED", "CANCELLED"];
        if (!allowed.includes(status))
            throw new Error(`Invalid status: ${status}. Allowed: ${allowed.join(", ")}`);
        const row = await prisma.govPO.update({
            where: { poId },
            data: { status, ...(notes ? { notes } : {}) },
            include,
        });
        return toPO(row);
    }
    async inventorySummary() {
        const lineItems = await prisma.govPOLineItem.findMany();
        const bysku = {};
        for (const li of lineItems) {
            if (!bysku[li.sku])
                bysku[li.sku] = { sku: li.sku, totalQuantity: 0, totalValue: 0 };
            bysku[li.sku].totalQuantity += li.quantity;
            bysku[li.sku].totalValue += li.extended;
        }
        return Object.values(bysku).sort((a, b) => b.totalValue - a.totalValue);
    }
}
exports.Division4Service = Division4Service;
exports.division4Service = new Division4Service();
//# sourceMappingURL=division4.service.js.map