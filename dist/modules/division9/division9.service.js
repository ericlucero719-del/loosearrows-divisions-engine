"use strict";
// modules/division9/division9.service.ts
// Division 9 — Financials & Invoicing (PostgreSQL-backed)
Object.defineProperty(exports, "__esModule", { value: true });
exports.division9Service = exports.Division9Service = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function nextInvoiceRef() {
    const count = await prisma.govInvoice.count();
    return `INV-${String(count + 1).padStart(3, "0")}`;
}
function toInvoice(row) {
    return {
        invoiceId: row.invoiceId,
        invoiceRef: row.invoiceRef,
        bidId: row.bidId ?? undefined,
        poId: row.poId ?? undefined,
        vendorId: row.vendorId ?? undefined,
        vendorName: row.vendorName ?? undefined,
        agencyName: row.agencyName ?? undefined,
        status: row.status,
        totalAmount: row.totalAmount,
        paidAmount: row.paidAmount,
        dueDate: row.dueDate ?? undefined,
        paidAt: row.paidAt ?? undefined,
        notes: row.notes ?? undefined,
        lineItems: (row.lineItems ?? []).map((li) => ({
            id: li.id,
            sku: li.sku ?? undefined,
            clin: li.clin ?? undefined,
            description: li.description ?? undefined,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            extended: li.extended,
        })),
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
        updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
    };
}
const include = { lineItems: true };
class Division9Service {
    async listInvoices(status) {
        const where = status ? { status } : {};
        const rows = await prisma.govInvoice.findMany({ where, include, orderBy: { createdAt: "desc" } });
        return rows.map(toInvoice);
    }
    async getInvoice(invoiceId) {
        const row = await prisma.govInvoice.findUnique({ where: { invoiceId }, include });
        return row ? toInvoice(row) : null;
    }
    async createInvoice(data) {
        const invoiceRef = await nextInvoiceRef();
        const items = (data.lineItems ?? []).map(li => ({ ...li, extended: li.quantity * li.unitPrice }));
        const totalAmount = items.reduce((s, i) => s + i.extended, 0);
        const row = await prisma.govInvoice.create({
            data: {
                invoiceRef,
                bidId: data.bidId,
                poId: data.poId,
                vendorId: data.vendorId,
                vendorName: data.vendorName,
                agencyName: data.agencyName,
                dueDate: data.dueDate,
                notes: data.notes,
                totalAmount,
                lineItems: { create: items },
            },
            include,
        });
        return toInvoice(row);
    }
    async createInvoiceFromBid(bidId, dueDate) {
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
        }));
        return this.createInvoice({
            bidId: bid.bidId,
            vendorId: bid.vendorId,
            vendorName: bid.vendorName ?? undefined,
            agencyName: bid.contract.agency,
            dueDate,
            notes: `Auto-generated from ${bid.bidRef ?? bid.bidId}`,
            lineItems: items,
        });
    }
    async createInvoiceFromPO(poId, dueDate) {
        const po = await prisma.govPO.findUnique({ where: { poId }, include: { lineItems: true } });
        if (!po)
            throw new Error(`PO ${poId} not found`);
        const items = po.lineItems.map(li => ({
            sku: li.sku,
            clin: li.clin ?? undefined,
            description: li.description ?? undefined,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
        }));
        return this.createInvoice({
            poId: po.poId,
            vendorId: po.vendorId ?? undefined,
            vendorName: po.vendorName ?? undefined,
            agencyName: po.agencyName ?? undefined,
            dueDate,
            notes: `Auto-generated from ${po.poRef}`,
            lineItems: items,
        });
    }
    async updateStatus(invoiceId, status, notes) {
        const allowed = ["DRAFT", "SENT", "PAID", "OVERDUE", "DISPUTED", "CANCELLED"];
        if (!allowed.includes(status))
            throw new Error(`Invalid status: ${status}. Allowed: ${allowed.join(", ")}`);
        const row = await prisma.govInvoice.update({
            where: { invoiceId },
            data: { status, ...(notes ? { notes } : {}) },
            include,
        });
        return toInvoice(row);
    }
    async recordPayment(invoiceId, amount) {
        const inv = await prisma.govInvoice.findUnique({ where: { invoiceId } });
        if (!inv)
            throw new Error(`Invoice ${invoiceId} not found`);
        const newPaid = inv.paidAmount + amount;
        const newStatus = newPaid >= inv.totalAmount ? "PAID"
            : newPaid > 0 ? "PARTIAL"
                : inv.status;
        const paidAt = newStatus === "PAID" ? new Date().toISOString() : inv.paidAt;
        const row = await prisma.govInvoice.update({
            where: { invoiceId },
            data: { paidAmount: newPaid, status: newStatus, ...(paidAt ? { paidAt } : {}) },
            include,
        });
        return toInvoice(row);
    }
    async financialSummary() {
        const invoices = await prisma.govInvoice.findMany();
        const totalBilled = invoices.reduce((s, i) => s + i.totalAmount, 0);
        const totalCollected = invoices.reduce((s, i) => s + i.paidAmount, 0);
        const outstanding = totalBilled - totalCollected;
        const byStatus = {};
        for (const inv of invoices) {
            byStatus[inv.status] = (byStatus[inv.status] ?? 0) + 1;
        }
        return {
            totalInvoices: invoices.length,
            totalBilled: Math.round(totalBilled * 100) / 100,
            totalCollected: Math.round(totalCollected * 100) / 100,
            outstanding: Math.round(outstanding * 100) / 100,
            byStatus,
        };
    }
}
exports.Division9Service = Division9Service;
exports.division9Service = new Division9Service();
//# sourceMappingURL=division9.service.js.map