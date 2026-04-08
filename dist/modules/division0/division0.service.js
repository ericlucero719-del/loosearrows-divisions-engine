"use strict";
// modules/division0/division0.service.ts
// Division 0 — System Command Center (admin-only)
Object.defineProperty(exports, "__esModule", { value: true });
exports.division0Service = exports.Division0Service = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const safeCount = async (fn) => {
    try {
        return await fn();
    }
    catch {
        return 0;
    }
};
class Division0Service {
    async fullSystemStatus() {
        const [products, contracts, bids, workRequests, pos, shipments, invoices, vendors, agencies, complianceDocs,] = await Promise.all([
            safeCount(() => prisma.govProduct.count()),
            safeCount(() => prisma.govContract.count()),
            safeCount(() => prisma.govBid.count()),
            safeCount(() => prisma.govWorkRequest.count()),
            safeCount(() => prisma.govPO.count()),
            safeCount(() => prisma.govShipment.count()),
            safeCount(() => prisma.govInvoice.count()),
            safeCount(() => prisma.govVendor.count()),
            safeCount(() => prisma.govAgency.count()),
            safeCount(() => prisma.govComplianceDoc.count()),
        ]);
        const divisions = [
            { id: 0, name: "System Command Center", records: 0, status: "SYSTEM" },
            { id: 1, name: "Product Intake & Pricing", records: products, status: products > 0 ? "ACTIVE" : "EMPTY" },
            { id: 2, name: "Contract Alignment", records: contracts, status: contracts > 0 ? "ACTIVE" : "EMPTY" },
            { id: 3, name: "Requests & Work Orders", records: workRequests + bids, status: (workRequests + bids) > 0 ? "ACTIVE" : "EMPTY" },
            { id: 4, name: "Inventory & Assets", records: pos, status: pos > 0 ? "ACTIVE" : "EMPTY" },
            { id: 5, name: "Logistics & Fulfillment", records: shipments, status: shipments > 0 ? "ACTIVE" : "EMPTY" },
            { id: 6, name: "Compliance & Documentation", records: complianceDocs, status: complianceDocs > 0 ? "ACTIVE" : "EMPTY" },
            { id: 7, name: "Vendor & Partner Management", records: vendors, status: vendors > 0 ? "ACTIVE" : "EMPTY" },
            { id: 8, name: "Agency / Customer Management", records: agencies, status: agencies > 0 ? "ACTIVE" : "EMPTY" },
            { id: 9, name: "Financials", records: invoices, status: invoices > 0 ? "ACTIVE" : "EMPTY" },
            { id: 10, name: "Intelligence & System View", records: -1, status: "ACTIVE" },
        ];
        const active = divisions.filter(d => d.status === "ACTIVE").length;
        const empty = divisions.filter(d => d.status === "EMPTY").length;
        const total = divisions.filter(d => d.status !== "SYSTEM").length;
        return {
            systemName: "Loose Arrows Divisions Engine",
            version: "1.0.0",
            generatedAt: new Date().toISOString(),
            operationalScore: `${Math.round((active / total) * 100)}%`,
            summary: { active, empty, total },
            divisions,
        };
    }
    async pipelineSummary() {
        const [contracts, bids, pos, shipments, invoices,] = await Promise.all([
            prisma.govContract.findMany({ select: { status: true } }),
            prisma.govBid.findMany({ select: { status: true } }),
            prisma.govPO.findMany({ select: { status: true } }),
            prisma.govShipment.findMany({ select: { status: true } }),
            prisma.govInvoice.findMany({ select: { status: true } }),
        ]);
        function tally(rows) {
            const out = {};
            for (const r of rows) {
                out[r.status] = (out[r.status] ?? 0) + 1;
            }
            return out;
        }
        return {
            generatedAt: new Date().toISOString(),
            contracts: { total: contracts.length, byStatus: tally(contracts) },
            bids: { total: bids.length, byStatus: tally(bids) },
            purchaseOrders: { total: pos.length, byStatus: tally(pos) },
            shipments: { total: shipments.length, byStatus: tally(shipments) },
            invoices: { total: invoices.length, byStatus: tally(invoices) },
        };
    }
    async financialRollup() {
        const invoices = await prisma.govInvoice.findMany({
            select: { status: true, totalAmount: true },
        });
        const pos = await prisma.govPO.findMany({
            select: { status: true, totalValue: true },
        });
        const totalInvoiced = invoices.reduce((s, i) => s + (i.totalAmount ?? 0), 0);
        const totalPaid = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + (i.totalAmount ?? 0), 0);
        const totalPending = invoices.filter((i) => i.status !== "PAID").reduce((s, i) => s + (i.totalAmount ?? 0), 0);
        const totalPoValue = pos.reduce((s, p) => s + (p.totalValue ?? 0), 0);
        return {
            generatedAt: new Date().toISOString(),
            totalPoValue: Math.round(totalPoValue * 100) / 100,
            totalInvoiced: Math.round(totalInvoiced * 100) / 100,
            totalPaid: Math.round(totalPaid * 100) / 100,
            totalOutstanding: Math.round(totalPending * 100) / 100,
            invoiceCount: invoices.length,
            paidCount: invoices.filter((i) => i.status === "PAID").length,
        };
    }
    async vendorRoster() {
        const vendors = await prisma.govVendor.findMany({
            select: {
                id: true, name: true, status: true,
                categoriesJson: true, contactEmail: true,
            },
            orderBy: { name: "asc" },
        });
        return vendors.map(v => ({
            id: v.id,
            name: v.name,
            status: v.status,
            categories: JSON.parse(v.categoriesJson || "[]"),
            email: v.contactEmail ?? undefined,
        }));
    }
    async contractRoster() {
        const rows = await prisma.govContract.findMany({
            select: {
                contractId: true, contractRef: true, contractName: true,
                status: true, agency: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return rows.map(r => ({
            contractId: r.contractId,
            contractRef: r.contractRef ?? undefined,
            name: r.contractName,
            status: r.status,
            agency: r.agency,
        }));
    }
    async recentActivity(limit = 20) {
        const [bids, pos, shipments, invoices] = await Promise.all([
            prisma.govBid.findMany({ select: { bidRef: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: limit }),
            prisma.govPO.findMany({ select: { poRef: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: limit }),
            prisma.govShipment.findMany({ select: { shipRef: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: limit }),
            prisma.govInvoice.findMany({ select: { invoiceRef: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: limit }),
        ]);
        const events = [
            ...bids.map((b) => ({ type: "BID", ref: b.bidRef, status: b.status, at: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt })),
            ...pos.map((p) => ({ type: "PO", ref: p.poRef, status: p.status, at: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt })),
            ...shipments.map((s) => ({ type: "SHIPMENT", ref: s.shipRef, status: s.status, at: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt })),
            ...invoices.map((i) => ({ type: "INVOICE", ref: i.invoiceRef, status: i.status, at: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt })),
        ];
        events.sort((a, b) => b.at.localeCompare(a.at));
        return events.slice(0, limit);
    }
}
exports.Division0Service = Division0Service;
exports.division0Service = new Division0Service();
//# sourceMappingURL=division0.service.js.map