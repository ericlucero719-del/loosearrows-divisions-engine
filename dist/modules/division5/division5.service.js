"use strict";
// modules/division5/division5.service.ts
// Division 5 — Shipments & Fulfillment (PostgreSQL-backed)
Object.defineProperty(exports, "__esModule", { value: true });
exports.division5Service = exports.Division5Service = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function nextShipRef() {
    const count = await prisma.govShipment.count();
    return `SHIP-${String(count + 1).padStart(3, "0")}`;
}
function toShipment(row) {
    return {
        shipmentId: row.shipmentId,
        shipRef: row.shipRef,
        poId: row.poId ?? undefined,
        bidId: row.bidId ?? undefined,
        vendorId: row.vendorId ?? undefined,
        vendorName: row.vendorName ?? undefined,
        carrier: row.carrier ?? undefined,
        trackingNumber: row.trackingNumber ?? undefined,
        deliveryLocation: row.deliveryLocation ?? undefined,
        expectedDelivery: row.expectedDelivery ?? undefined,
        deliveredAt: row.deliveredAt ?? undefined,
        status: row.status,
        notes: row.notes ?? undefined,
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
        updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
    };
}
class Division5Service {
    async listShipments(status) {
        const where = status ? { status } : {};
        const rows = await prisma.govShipment.findMany({ where, orderBy: { createdAt: "desc" } });
        return rows.map(toShipment);
    }
    async getShipment(shipmentId) {
        const row = await prisma.govShipment.findUnique({ where: { shipmentId } });
        return row ? toShipment(row) : null;
    }
    async createShipment(data) {
        const shipRef = await nextShipRef();
        const row = await prisma.govShipment.create({ data: { shipRef, ...data } });
        return toShipment(row);
    }
    async createShipmentFromPO(poId) {
        const po = await prisma.govPO.findUnique({ where: { poId } });
        if (!po)
            throw new Error(`PO ${poId} not found`);
        return this.createShipment({
            poId,
            vendorId: po.vendorId ?? undefined,
            vendorName: po.vendorName ?? undefined,
            notes: `Auto-generated from ${po.poRef}`,
        });
    }
    async updateStatus(shipmentId, status, notes) {
        const allowed = ["PENDING", "IN_TRANSIT", "DELIVERED", "DELAYED", "CANCELLED"];
        if (!allowed.includes(status))
            throw new Error(`Invalid status: ${status}. Allowed: ${allowed.join(", ")}`);
        const row = await prisma.govShipment.update({
            where: { shipmentId },
            data: { status, ...(notes ? { notes } : {}) },
        });
        return toShipment(row);
    }
    async updateTracking(shipmentId, data) {
        const row = await prisma.govShipment.update({ where: { shipmentId }, data });
        return toShipment(row);
    }
    async markDelivered(shipmentId) {
        const row = await prisma.govShipment.update({
            where: { shipmentId },
            data: { status: "DELIVERED", deliveredAt: new Date().toISOString() },
        });
        return toShipment(row);
    }
    async listOverdue() {
        const now = new Date().toISOString().split("T")[0];
        const rows = await prisma.govShipment.findMany({
            where: { status: { in: ["PENDING", "IN_TRANSIT"] }, expectedDelivery: { not: null } },
            orderBy: { expectedDelivery: "asc" },
        });
        return rows.filter(r => r.expectedDelivery && r.expectedDelivery < now).map(toShipment);
    }
    async fulfillmentSummary() {
        const [total, pending, inTransit, delivered, delayed, cancelled] = await Promise.all([
            prisma.govShipment.count(),
            prisma.govShipment.count({ where: { status: "PENDING" } }),
            prisma.govShipment.count({ where: { status: "IN_TRANSIT" } }),
            prisma.govShipment.count({ where: { status: "DELIVERED" } }),
            prisma.govShipment.count({ where: { status: "DELAYED" } }),
            prisma.govShipment.count({ where: { status: "CANCELLED" } }),
        ]);
        return { total, pending, inTransit, delivered, delayed, cancelled };
    }
}
exports.Division5Service = Division5Service;
exports.division5Service = new Division5Service();
//# sourceMappingURL=division5.service.js.map