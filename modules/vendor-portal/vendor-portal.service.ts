// modules/vendor-portal/vendor-portal.service.ts
// LooseArrows Supply & Logistics™ — Vendor Portal Data Service
// Aggregates POs, shipments, and invoices for a specific vendor.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const vendorPortalService = {

  // Find vendor by ID or name (case-insensitive name search)
  async findVendor(identifier: string) {
    let vendor = await (prisma as any).govVendor.findFirst({
      where: { id: identifier },
    });
    if (!vendor) {
      vendor = await (prisma as any).govVendor.findFirst({
        where: { name: { contains: identifier, mode: "insensitive" } },
      });
    }
    return vendor;
  },

  // Get full vendor dashboard: POs, shipments, invoices
  async dashboard(vendorIdentifier: string) {
    const vendor = await vendorPortalService.findVendor(vendorIdentifier);
    if (!vendor) throw new Error(`Vendor "${vendorIdentifier}" not found`);

    const [pos, shipments, invoices] = await Promise.all([
      (prisma as any).govPO.findMany({
        where: {
          OR: [
            { vendorId:   vendor.id   },
            { vendorName: { contains: vendor.name, mode: "insensitive" } },
          ],
        },
        include: { lineItems: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      (prisma as any).govShipment.findMany({
        where: {
          OR: [
            { vendorId:   vendor.id   },
            { vendorName: { contains: vendor.name, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      (prisma as any).govInvoice.findMany({
        where: {
          OR: [
            { vendorId:   vendor.id   },
            { vendorName: { contains: vendor.name, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    const totalPoValue      = pos.reduce((s: number, p: any) => s + (p.totalValue ?? 0), 0);
    const totalInvoiced     = invoices.reduce((s: number, i: any) => s + (i.totalAmount ?? 0), 0);
    const totalPaid         = invoices.reduce((s: number, i: any) => s + (i.paidAmount ?? 0), 0);
    const totalOutstanding  = Math.round((totalInvoiced - totalPaid) * 100) / 100;

    return {
      vendor: {
        id:           vendor.id,
        name:         vendor.name,
        contactEmail: vendor.contactEmail,
        status:       vendor.status,
        categories:   JSON.parse(vendor.categoriesJson ?? "[]"),
        capabilities: JSON.parse(vendor.capabilitiesJson ?? "[]"),
        notes:        vendor.performanceNotes,
      },
      summary: {
        totalPos:          pos.length,
        totalPoValue:      Math.round(totalPoValue * 100) / 100,
        totalShipments:    shipments.length,
        totalInvoices:     invoices.length,
        totalInvoiced:     Math.round(totalInvoiced * 100) / 100,
        totalPaid:         Math.round(totalPaid * 100) / 100,
        totalOutstanding,
      },
      pos,
      shipments,
      invoices,
    };
  },

  // Update a shipment status (vendor acknowledges delivery, etc.)
  async updateShipmentStatus(shipmentId: string, status: string, notes?: string) {
    const existing = await (prisma as any).govShipment.findUnique({ where: { shipmentId } });
    if (!existing) throw new Error(`Shipment ${shipmentId} not found`);
    return (prisma as any).govShipment.update({
      where: { shipmentId },
      data:  { status, ...(notes ? { notes } : {}) },
    });
  },

  // List all vendors (for the portal vendor-select dropdown)
  async listVendors() {
    const vendors = await (prisma as any).govVendor.findMany({
      select: { id: true, name: true, contactEmail: true, status: true },
      orderBy: { name: "asc" },
    });
    return vendors;
  },
};
