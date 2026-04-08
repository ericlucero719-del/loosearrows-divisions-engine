"use strict";
// modules/commerce/commerce.service.ts
// LooseArrows Supply & Logistics™
// Multi-Platform Commerce Automation — Shared Service
// Author: Eric Lucero — Chief Architect & Commander
//
// One service class drives all platforms (Instagram, YouTube, Amazon, + any future).
// Each platform module creates a configured instance via CommerceService.forPlatform().
// All orders persist to the shared CommerceOrder table with platform discrimination.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommerceService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ─── Shared pipeline steps ────────────────────────────────────────────────────
async function matchSKU(items) {
    const results = [];
    for (const item of items) {
        const product = await prisma.govProduct.findUnique({ where: { sku: item.sku } });
        if (product) {
            results.push({ sku: item.sku, name: product.name, cost: product.cost, price: product.price, marginPct: product.marginPct, matched: true });
        }
        else {
            results.push({ sku: item.sku, name: item.name ?? "Unknown", cost: 0, price: item.unitPrice ?? 0, marginPct: 0, matched: false });
        }
    }
    return results;
}
function calculateProfit(items, skuMatch) {
    let profit = 0;
    for (const item of items) {
        const m = skuMatch.find(s => s.sku === item.sku);
        if (m?.matched) {
            profit += ((item.unitPrice ?? m.price) - m.cost) * item.quantity;
        }
    }
    return Math.round(profit * 100) / 100;
}
async function selectVendor() {
    const v = await prisma.govVendor.findFirst({ where: { status: "active" }, select: { id: true, name: true } });
    return v ?? null;
}
async function runComplianceCheck() {
    const REQUIRED = ["SAM_REGISTRATION", "CAGE_CODE", "W9"];
    const docs = await prisma.govComplianceDoc.findMany({ where: { status: "ACTIVE" }, select: { docType: true } });
    const present = new Set(docs.map((d) => d.docType));
    const missing = REQUIRED.filter(t => !present.has(t));
    return { passed: missing.length === 0, activeDocCount: docs.length, missingTypes: missing };
}
// ─── CommerceService ──────────────────────────────────────────────────────────
class CommerceService {
    constructor(cfg) {
        this.cfg = cfg;
    }
    static forPlatform(cfg) {
        return new CommerceService(cfg);
    }
    pfx(type, n) {
        return `${this.cfg.prefix}-${type}-${String(n).padStart(3, "0")}`;
    }
    // 1. Capture — full intake pipeline
    async captureOrder(payload) {
        const skuMatch = await matchSKU(payload.items);
        const profitUsd = calculateProfit(payload.items, skuMatch);
        const record = await prisma.commerceOrder.create({
            data: {
                platform: this.cfg.platform,
                externalId: payload.order_id,
                itemsJson: JSON.stringify(payload.items),
                skuMatchJson: JSON.stringify(skuMatch),
                profitUsd,
                channel: payload.channel,
                notes: payload.notes,
                status: "RECEIVED",
            },
        });
        const vendor = await selectVendor();
        const compliance = await runComplianceCheck();
        const total = payload.items.reduce((s, i) => s + (i.unitPrice ?? 0) * i.quantity, 0);
        const poCount = await prisma.govPO.count();
        const poRef = this.pfx("PO", poCount + 1);
        const po = await prisma.govPO.create({
            data: {
                poRef,
                vendorId: vendor?.id,
                vendorName: vendor?.name ?? `${this.cfg.label} Direct`,
                agencyName: this.cfg.label,
                totalValue: Math.round(total * 100) / 100,
                status: "SENT",
                notes: `Auto-generated from ${this.cfg.platform} order ${payload.order_id}. Compliance: ${compliance.passed ? "PASS" : "REVIEW REQUIRED"}`,
            },
        });
        await prisma.commerceOrder.update({
            where: { orderId: record.orderId },
            data: { poId: po.poId, vendorId: vendor?.id, vendorName: vendor?.name, status: "PO_SENT" },
        });
        return {
            status: "Order captured",
            platform: this.cfg.platform,
            order_id: payload.order_id,
            internalId: record.orderId,
            profitPreview: `$${profitUsd.toFixed(2)}`,
            skuMatch,
            vendor: vendor?.name ?? "No vendor matched",
            compliance,
            po: { poRef: po.poRef, status: po.status, totalValue: po.totalValue },
        };
    }
    // 2. Fulfillment
    async fulfill(order_id, method, carrier = "UPS", trackingRef) {
        const order = await prisma.commerceOrder.findFirst({
            where: { platform: this.cfg.platform, externalId: order_id },
        });
        if (!order)
            throw new Error(`${this.cfg.platform} order ${order_id} not found`);
        const labelRef = `${this.cfg.prefix}-LBL-${Date.now().toString(36).toUpperCase()}`;
        const ref = trackingRef ?? `${this.cfg.prefix}-TRK-${Date.now().toString(36).toUpperCase()}`;
        if (order.poId) {
            const shipCount = await prisma.govShipment.count();
            const shipRef = this.pfx("SHIP", shipCount + 1);
            const ship = await prisma.govShipment.create({
                data: {
                    shipRef,
                    poId: order.poId,
                    vendorId: order.vendorId,
                    vendorName: order.vendorName,
                    carrier: method === "home" ? carrier : undefined,
                    trackingNumber: method === "home" ? ref : undefined,
                    status: method === "home" ? "IN_TRANSIT" : "PENDING",
                    notes: `${this.cfg.platform} order ${order_id} — ${method} fulfillment`,
                },
            });
            await prisma.commerceOrder.update({
                where: { orderId: order.orderId },
                data: {
                    shipmentId: ship.shipmentId,
                    fulfillMethod: method,
                    trackingRef: method === "home" ? ref : null,
                    labelRef: method === "home" ? labelRef : null,
                    carrier: method === "home" ? carrier : null,
                    status: "FULFILLED",
                },
            });
        }
        else {
            await prisma.commerceOrder.update({
                where: { orderId: order.orderId },
                data: { fulfillMethod: method, trackingRef: ref, carrier, labelRef, status: "FULFILLED" },
            });
        }
        return {
            status: "Fulfillment triggered",
            platform: this.cfg.platform,
            order_id,
            method,
            ...(method === "home" ? { labelRef, trackingRef: ref } : {}),
        };
    }
    // 3. Invoice
    async invoice(order_id) {
        const order = await prisma.commerceOrder.findFirst({
            where: { platform: this.cfg.platform, externalId: order_id },
        });
        if (!order)
            throw new Error(`${this.cfg.platform} order ${order_id} not found`);
        const items = JSON.parse(order.itemsJson || "[]");
        const total = items.reduce((s, i) => s + (i.unitPrice ?? 0) * i.quantity, 0);
        const invCount = await prisma.govInvoice.count();
        const invoiceRef = this.pfx("INV", invCount + 1);
        const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        const inv = await prisma.govInvoice.create({
            data: {
                invoiceRef,
                poId: order.poId,
                vendorId: order.vendorId,
                vendorName: order.vendorName,
                agencyName: this.cfg.label,
                totalAmount: Math.round(total * 100) / 100,
                status: "SENT",
                dueDate,
                notes: `Auto-invoiced from ${this.cfg.platform} order ${order_id}`,
            },
        });
        await prisma.commerceOrder.update({
            where: { orderId: order.orderId },
            data: { invoiceId: inv.invoiceId, status: "INVOICED" },
        });
        return { status: "Invoice synced", platform: this.cfg.platform, order_id, invoiceRef: inv.invoiceRef, totalAmount: inv.totalAmount, dueDate };
    }
    // 4. Payment
    async recordPayment(order_id) {
        const order = await prisma.commerceOrder.findFirst({
            where: { platform: this.cfg.platform, externalId: order_id },
        });
        if (!order?.invoiceId)
            throw new Error(`No invoice found for ${this.cfg.platform} order ${order_id}. Run /invoice first.`);
        const inv = await prisma.govInvoice.findUnique({ where: { invoiceId: order.invoiceId } });
        await prisma.govInvoice.update({
            where: { invoiceId: inv.invoiceId },
            data: { status: "PAID", paidAmount: inv.totalAmount, paidAt: new Date().toISOString().split("T")[0] },
        });
        await prisma.commerceOrder.update({
            where: { orderId: order.orderId },
            data: { status: "PAID" },
        });
        return { status: "Payment recorded", platform: this.cfg.platform, order_id, invoiceRef: inv.invoiceRef, amount: inv.totalAmount };
    }
    // 5. Notify + inventory sync
    async notify(order_id, event) {
        const order = await prisma.commerceOrder.findFirst({
            where: { platform: this.cfg.platform, externalId: order_id },
        });
        if (!order)
            throw new Error(`${this.cfg.platform} order ${order_id} not found`);
        const note = `[${new Date().toISOString()}] ${event}`;
        const notes = order.notes ? `${order.notes}\n${note}` : note;
        await prisma.commerceOrder.update({ where: { orderId: order.orderId }, data: { notes } });
        // Update Division 1 inventory notes
        const items = JSON.parse(order.itemsJson || "[]");
        for (const item of items) {
            const product = await prisma.govProduct.findUnique({ where: { sku: item.sku } });
            if (product) {
                const pNote = `${product.notes ?? ""}\n[${this.cfg.platform}] Sold qty:${item.quantity} via order ${order_id}`.trim();
                await prisma.govProduct.update({ where: { sku: item.sku }, data: { notes: pNote } });
            }
        }
        return { status: "Notification sent", platform: this.cfg.platform, order_id, event };
    }
    // ── Queries ──────────────────────────────────────────────────────────────────
    async listOrders(status) {
        const where = { platform: this.cfg.platform };
        if (status)
            where.status = status;
        const rows = await prisma.commerceOrder.findMany({ where, orderBy: { createdAt: "desc" } });
        return rows.map((r) => ({
            orderId: r.orderId,
            platform: r.platform,
            externalId: r.externalId,
            status: r.status,
            profitUsd: r.profitUsd,
            vendorName: r.vendorName,
            poId: r.poId,
            shipmentId: r.shipmentId,
            invoiceId: r.invoiceId,
            fulfillMethod: r.fulfillMethod,
            trackingRef: r.trackingRef,
            channel: r.channel,
            createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
        }));
    }
    async getOrder(order_id) {
        const r = await prisma.commerceOrder.findFirst({
            where: { platform: this.cfg.platform, externalId: order_id },
        });
        if (!r)
            throw new Error(`${this.cfg.platform} order ${order_id} not found`);
        return {
            ...r,
            items: JSON.parse(r.itemsJson || "[]"),
            skuMatch: JSON.parse(r.skuMatchJson || "[]"),
            createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
            updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
        };
    }
    async summary() {
        const orders = await prisma.commerceOrder.findMany({ where: { platform: this.cfg.platform } });
        const total = orders.length;
        const paid = orders.filter((o) => o.status === "PAID").length;
        const revenue = orders.reduce((s, o) => {
            const items = JSON.parse(o.itemsJson || "[]");
            return s + items.reduce((ss, i) => ss + (i.unitPrice ?? 0) * i.quantity, 0);
        }, 0);
        const profit = orders.reduce((s, o) => s + (o.profitUsd ?? 0), 0);
        const byStatus = {};
        for (const o of orders) {
            byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
        }
        return {
            platform: this.cfg.platform,
            totalOrders: total,
            paidOrders: paid,
            totalRevenue: Math.round(revenue * 100) / 100,
            totalProfit: Math.round(profit * 100) / 100,
            byStatus,
        };
    }
    // Cross-platform summary (all platforms in one view)
    static async allPlatformsSummary() {
        const orders = await prisma.commerceOrder.findMany();
        const byPlatform = {};
        for (const o of orders) {
            if (!byPlatform[o.platform])
                byPlatform[o.platform] = { orders: 0, revenue: 0, profit: 0, byStatus: {} };
            const p = byPlatform[o.platform];
            const items = JSON.parse(o.itemsJson || "[]");
            p.orders++;
            p.revenue += items.reduce((s, i) => s + (i.unitPrice ?? 0) * i.quantity, 0);
            p.profit += o.profitUsd ?? 0;
            p.byStatus[o.status] = (p.byStatus[o.status] ?? 0) + 1;
        }
        const totalRevenue = Object.values(byPlatform).reduce((s, p) => s + p.revenue, 0);
        const totalOrders = Object.values(byPlatform).reduce((s, p) => s + p.orders, 0);
        const totalProfit = Object.values(byPlatform).reduce((s, p) => s + p.profit, 0);
        return {
            totalOrders: totalOrders,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            totalProfit: Math.round(totalProfit * 100) / 100,
            byPlatform: Object.fromEntries(Object.entries(byPlatform).map(([k, v]) => [k, {
                    ...v,
                    revenue: Math.round(v.revenue * 100) / 100,
                    profit: Math.round(v.profit * 100) / 100,
                }])),
        };
    }
}
exports.CommerceService = CommerceService;
//# sourceMappingURL=commerce.service.js.map