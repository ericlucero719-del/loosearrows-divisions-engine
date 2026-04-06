// modules/division5/division5.service.ts
// Division 5 — Shipments & Fulfillment (PostgreSQL-backed)

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function nextShipRef(): Promise<string> {
  const count = await prisma.govShipment.count();
  return `SHIP-${String(count + 1).padStart(3, "0")}`;
}

function toShipment(row: any) {
  return {
    shipmentId:       row.shipmentId,
    shipRef:          row.shipRef,
    poId:             row.poId             ?? undefined,
    bidId:            row.bidId            ?? undefined,
    vendorId:         row.vendorId         ?? undefined,
    vendorName:       row.vendorName       ?? undefined,
    carrier:          row.carrier          ?? undefined,
    trackingNumber:   row.trackingNumber   ?? undefined,
    deliveryLocation: row.deliveryLocation ?? undefined,
    expectedDelivery: row.expectedDelivery ?? undefined,
    deliveredAt:      row.deliveredAt      ?? undefined,
    status:           row.status,
    notes:            row.notes            ?? undefined,
    createdAt:        row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt:        row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
  };
}

export class Division5Service {

  async listShipments(status?: string) {
    const where = status ? { status } : {};
    const rows = await prisma.govShipment.findMany({ where, orderBy: { createdAt: "desc" } });
    return rows.map(toShipment);
  }

  async getShipment(shipmentId: string) {
    const row = await prisma.govShipment.findUnique({ where: { shipmentId } });
    return row ? toShipment(row) : null;
  }

  async createShipment(data: {
    poId?:             string;
    bidId?:            string;
    vendorId?:         string;
    vendorName?:       string;
    carrier?:          string;
    trackingNumber?:   string;
    deliveryLocation?: string;
    expectedDelivery?: string;
    notes?:            string;
  }) {
    const shipRef = await nextShipRef();
    const row = await prisma.govShipment.create({ data: { shipRef, ...data } });
    return toShipment(row);
  }

  async createShipmentFromPO(poId: string) {
    const po = await prisma.govPO.findUnique({ where: { poId } });
    if (!po) throw new Error(`PO ${poId} not found`);
    return this.createShipment({
      poId,
      vendorId:   po.vendorId   ?? undefined,
      vendorName: po.vendorName ?? undefined,
      notes:      `Auto-generated from ${po.poRef}`,
    });
  }

  async updateStatus(shipmentId: string, status: string, notes?: string) {
    const allowed = ["PENDING", "IN_TRANSIT", "DELIVERED", "DELAYED", "CANCELLED"];
    if (!allowed.includes(status)) throw new Error(`Invalid status: ${status}. Allowed: ${allowed.join(", ")}`);
    const row = await prisma.govShipment.update({
      where: { shipmentId },
      data:  { status, ...(notes ? { notes } : {}) },
    });
    return toShipment(row);
  }

  async updateTracking(shipmentId: string, data: {
    carrier?:          string;
    trackingNumber?:   string;
    expectedDelivery?: string;
    deliveryLocation?: string;
  }) {
    const row = await prisma.govShipment.update({ where: { shipmentId }, data });
    return toShipment(row);
  }

  async markDelivered(shipmentId: string) {
    const row = await prisma.govShipment.update({
      where: { shipmentId },
      data:  { status: "DELIVERED", deliveredAt: new Date().toISOString() },
    });
    return toShipment(row);
  }

  async listOverdue() {
    const now = new Date().toISOString().split("T")[0];
    const rows = await prisma.govShipment.findMany({
      where:   { status: { in: ["PENDING", "IN_TRANSIT"] }, expectedDelivery: { not: null } },
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

export const division5Service = new Division5Service();
