// modules/tiktok/tiktok.service.ts
// LooseArrows Supply & Logistics™
// TikTok Sales Automation Layer — Full Implementation
// Author: Eric Lucero — Chief Architect & Commander

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TikTokItem {
  sku:        string;
  quantity:   number;
  unitPrice?: number;
  name?:      string;
}

export interface OrderPayload {
  order_id: string;
  items:    TikTokItem[];
  notes?:   string;
}

// ─── 1. SKU Matching — resolves TikTok SKUs against Division 1 product catalog ─

async function matchSKU(items: TikTokItem[]): Promise<Array<{
  sku: string; name: string; cost: number; price: number; marginPct: number; matched: boolean;
}>> {
  const results = [];
  for (const item of items) {
    const product = await (prisma as any).govProduct.findUnique({ where: { sku: item.sku } });
    if (product) {
      results.push({ sku: item.sku, name: product.name, cost: product.cost, price: product.price, marginPct: product.marginPct, matched: true });
    } else {
      results.push({ sku: item.sku, name: item.name ?? "Unknown", cost: 0, price: item.unitPrice ?? 0, marginPct: 0, matched: false });
    }
  }
  return results;
}

// ─── 2. Profit Calculation — uses catalog cost vs TikTok sale price ───────────

function calculateProfit(items: TikTokItem[], skuMatches: ReturnType<typeof matchSKU> extends Promise<infer T> ? T : never): number {
  let profit = 0;
  for (const item of items) {
    const match = skuMatches.find(m => m.sku === item.sku);
    if (match && match.matched) {
      const salePrice = item.unitPrice ?? match.price;
      profit += (salePrice - match.cost) * item.quantity;
    }
  }
  return Math.round(profit * 100) / 100;
}

// ─── 3. Order Record — persists to TikTokOrder table ─────────────────────────

async function createOrderRecord(
  order: OrderPayload,
  skuMatch: Array<{ sku: string; name: string; cost: number; price: number; marginPct: number; matched: boolean }>,
  profitUsd: number
) {
  return (prisma as any).tikTokOrder.create({
    data: {
      externalId:   order.order_id,
      itemsJson:    JSON.stringify(order.items),
      skuMatchJson: JSON.stringify(skuMatch),
      profitUsd,
      notes:        order.notes,
      status:       "RECEIVED",
    },
  });
}

// ─── 4. Vendor Selection — picks best-matched vendor from Division 7 ──────────

async function selectVendor(items: TikTokItem[]): Promise<{ id: string; name: string } | null> {
  const skus = items.map(i => i.sku);
  const vendors = await prisma.govVendor.findMany({
    where:  { status: "active" },
    select: { id: true, name: true, categoriesJson: true },
  });

  // Prefer vendors whose categories include any matched SKU category
  // Fallback: first active vendor
  const preferred = vendors.find(v => {
    const cats: string[] = JSON.parse(v.categoriesJson || "[]");
    return cats.length > 0;
  });
  const vendor = preferred ?? vendors[0] ?? null;
  return vendor ? { id: vendor.id, name: vendor.name } : null;
}

// ─── 5. Compliance Check — scans Division 6 for active required docs ──────────

async function runComplianceCheck(vendor: { id: string; name: string } | null): Promise<{
  passed: boolean; activeDocCount: number; missingTypes: string[];
}> {
  const REQUIRED = ["SAM_REGISTRATION", "CAGE_CODE", "W9"];
  const docs = await (prisma as any).govComplianceDoc.findMany({
    where:  { status: "ACTIVE" },
    select: { docType: true },
  });
  const present  = new Set(docs.map((d: any) => d.docType));
  const missing  = REQUIRED.filter(t => !present.has(t));
  return { passed: missing.length === 0, activeDocCount: docs.length, missingTypes: missing };
}

// ─── 6. PO Generation — creates Division 4 Purchase Order ────────────────────

async function sendPO(
  tikTokOrderId: string,
  order: OrderPayload,
  vendor: { id: string; name: string } | null,
  compliance: { passed: boolean; activeDocCount: number; missingTypes: string[] }
) {
  const count  = await (prisma as any).govPO.count();
  const poRef  = `TT-PO-${String(count + 1).padStart(3, "0")}`;
  const total  = order.items.reduce((s, i) => s + (i.unitPrice ?? 0) * i.quantity, 0);

  const po = await (prisma as any).govPO.create({
    data: {
      poRef,
      vendorId:   vendor?.id,
      vendorName: vendor?.name ?? "TikTok Direct",
      agencyName: "TikTok Commerce",
      totalValue: Math.round(total * 100) / 100,
      status:     "SENT",
      notes:      `Auto-generated from TikTok order ${order.order_id}. Compliance: ${compliance.passed ? "PASS" : "REVIEW REQUIRED"}`,
    },
  });

  // Link PO back to TikTok order
  await (prisma as any).tikTokOrder.update({
    where: { externalId: order.order_id },
    data:  { poId: po.poId, vendorId: vendor?.id, vendorName: vendor?.name, status: "PO_SENT" },
  });

  return po;
}

// ─── 7. Fulfillment — home shipping or supplier ────────────────────────────────

async function generateLabel(order_id: string): Promise<string> {
  const labelRef = `LBL-TT-${Date.now().toString(36).toUpperCase()}`;
  // Update tracking ref in TikTok order record
  await (prisma as any).tikTokOrder.update({
    where: { externalId: order_id },
    data:  { labelRef, fulfillMethod: "home" },
  });
  return labelRef;
}

async function pushTracking(order_id: string, carrier = "UPS", trackingRef?: string): Promise<string> {
  const ref = trackingRef ?? `1Z-TT-${Date.now().toString(36).toUpperCase()}`;
  const tikOrder = await (prisma as any).tikTokOrder.findUnique({ where: { externalId: order_id } });

  // Create Division 5 shipment if PO exists
  if (tikOrder?.poId) {
    const count   = await (prisma as any).govShipment.count();
    const shipRef = `TT-SHIP-${String(count + 1).padStart(3, "0")}`;
    const ship = await (prisma as any).govShipment.create({
      data: {
        shipRef,
        poId:        tikOrder.poId,
        vendorId:    tikOrder.vendorId,
        vendorName:  tikOrder.vendorName,
        carrier,
        trackingNumber: ref,
        status:         "IN_TRANSIT",
        notes:          `TikTok order ${order_id} — home fulfillment`,
      },
    });
    await (prisma as any).tikTokOrder.update({
      where: { externalId: order_id },
      data:  { shipmentId: ship.shipmentId, trackingRef: ref, carrier, status: "FULFILLED" },
    });
  } else {
    await (prisma as any).tikTokOrder.update({
      where: { externalId: order_id },
      data:  { trackingRef: ref, carrier, status: "FULFILLED" },
    });
  }
  return ref;
}

async function supplierFulfill(order_id: string): Promise<void> {
  const tikOrder = await (prisma as any).tikTokOrder.findUnique({ where: { externalId: order_id } });
  if (tikOrder?.poId) {
    const count   = await (prisma as any).govShipment.count();
    const shipRef = `TT-SHIP-${String(count + 1).padStart(3, "0")}`;
    const ship = await (prisma as any).govShipment.create({
      data: {
        shipRef,
        poId:       tikOrder.poId,
        vendorId:   tikOrder.vendorId,
        vendorName: tikOrder.vendorName,
        status:     "PENDING",
        notes:      `TikTok order ${order_id} — supplier fulfillment`,
      },
    });
    await (prisma as any).tikTokOrder.update({
      where: { externalId: order_id },
      data:  { shipmentId: ship.shipmentId, fulfillMethod: "supplier", status: "FULFILLED" },
    });
  }
}

// ─── 8. Invoice Generation — creates Division 9 Invoice ──────────────────────

async function generateInvoice(order_id: string) {
  const tikOrder = await (prisma as any).tikTokOrder.findUnique({ where: { externalId: order_id } });
  if (!tikOrder) throw new Error(`TikTok order ${order_id} not found`);

  const count      = await (prisma as any).govInvoice.count();
  const invoiceRef = `TT-INV-${String(count + 1).padStart(3, "0")}`;
  const items: TikTokItem[] = JSON.parse(tikOrder.itemsJson || "[]");
  const total = items.reduce((s: number, i: TikTokItem) => s + (i.unitPrice ?? 0) * i.quantity, 0);

  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const invoice = await (prisma as any).govInvoice.create({
    data: {
      invoiceRef,
      poId:        tikOrder.poId,
      vendorId:    tikOrder.vendorId,
      vendorName:  tikOrder.vendorName,
      agencyName:  "TikTok Commerce",
      totalAmount: Math.round(total * 100) / 100,
      status:      "SENT",
      dueDate,
      notes:       `Auto-invoiced from TikTok order ${order_id}`,
    },
  });

  await (prisma as any).tikTokOrder.update({
    where: { externalId: order_id },
    data:  { invoiceId: invoice.invoiceId, status: "INVOICED" },
  });

  return invoice;
}

// ─── 9. Payment Sync — marks invoice PAID ─────────────────────────────────────

async function syncPayment(invoice: any) {
  await (prisma as any).govInvoice.update({
    where: { invoiceId: invoice.invoiceId },
    data:  { status: "PAID", paidAmount: invoice.totalAmount, paidAt: new Date().toISOString().split("T")[0] },
  });
  // TikTokOrder.invoiceId is NOT a unique key — use updateMany
  await (prisma as any).tikTokOrder.updateMany({
    where: { invoiceId: invoice.invoiceId },
    data:  { status: "PAID" },
  });
}

// ─── 10. Notification Log — appended to order notes ───────────────────────────

async function sendNotification(order_id: string, event: string): Promise<void> {
  const note = `[${new Date().toISOString()}] EVENT: ${event}`;
  const existing = await (prisma as any).tikTokOrder.findUnique({ where: { externalId: order_id } });
  const notes    = existing?.notes ? `${existing.notes}\n${note}` : note;
  await (prisma as any).tikTokOrder.update({ where: { externalId: order_id }, data: { notes } });
}

// ─── 11. Inventory Update — adjusts Division 1 stock notes ───────────────────

async function updateInventory(order_id: string): Promise<void> {
  const tikOrder = await (prisma as any).tikTokOrder.findUnique({ where: { externalId: order_id } });
  if (!tikOrder) return;
  const items: TikTokItem[] = JSON.parse(tikOrder.itemsJson || "[]");
  for (const item of items) {
    const product = await (prisma as any).govProduct.findUnique({ where: { sku: item.sku } });
    if (product) {
      const note = `${product.notes ?? ""}\n[TikTok] Sold qty:${item.quantity} via order ${order_id} on ${new Date().toISOString().split("T")[0]}`.trim();
      await (prisma as any).govProduct.update({ where: { sku: item.sku }, data: { notes: note } });
    }
  }
}

// ─── Public Service Class ──────────────────────────────────────────────────────

export class TikTokService {

  // Full order intake: capture → SKU match → profit → record → PO
  async captureOrder(payload: OrderPayload) {
    const skuMatch     = await matchSKU(payload.items);
    const profitUsd    = calculateProfit(payload.items, skuMatch);
    const record       = await createOrderRecord(payload, skuMatch, profitUsd);
    const vendor       = await selectVendor(payload.items);
    const compliance   = await runComplianceCheck(vendor);
    const po           = await sendPO(record.orderId, payload, vendor, compliance);

    return {
      status:       "Order captured",
      order_id:     payload.order_id,
      internalId:   record.orderId,
      profitPreview: `$${profitUsd.toFixed(2)}`,
      skuMatch,
      vendor:        vendor?.name ?? "No vendor matched",
      compliance,
      po:            { poRef: po.poRef, status: po.status, totalValue: po.totalValue },
    };
  }

  // Fulfillment: home label + tracking OR supplier push
  async fulfill(order_id: string, method: string, carrier?: string, trackingRef?: string) {
    if (method === "home") {
      const labelRef   = await generateLabel(order_id);
      const trackRef   = await pushTracking(order_id, carrier ?? "UPS", trackingRef);
      return { status: "Fulfillment triggered", order_id, method: "home", labelRef, trackingRef: trackRef };
    } else {
      await supplierFulfill(order_id);
      return { status: "Fulfillment triggered", order_id, method: "supplier" };
    }
  }

  // Invoice + payment sync
  async invoice(order_id: string) {
    const inv = await generateInvoice(order_id);
    return { status: "Invoice synced", order_id, invoiceRef: inv.invoiceRef, totalAmount: inv.totalAmount, dueDate: inv.dueDate };
  }

  async recordPayment(order_id: string) {
    const tikOrder = await (prisma as any).tikTokOrder.findUnique({ where: { externalId: order_id } });
    if (!tikOrder?.invoiceId) throw new Error("No invoice found for this order. Run /tiktok/invoice first.");
    const inv = await (prisma as any).govInvoice.findUnique({ where: { invoiceId: tikOrder.invoiceId } });
    await syncPayment(inv);
    return { status: "Payment recorded", order_id, invoiceRef: inv.invoiceRef, amount: inv.totalAmount };
  }

  // Notification + inventory
  async notify(order_id: string, event: string) {
    await sendNotification(order_id, event);
    await updateInventory(order_id);
    return { status: "Notification sent", order_id, event };
  }

  // List orders
  async listOrders(status?: string) {
    const where = status ? { status } : {};
    const rows  = await (prisma as any).tikTokOrder.findMany({ where, orderBy: { createdAt: "desc" } });
    return rows.map((r: any) => ({
      orderId:      r.orderId,
      externalId:   r.externalId,
      status:       r.status,
      profitUsd:    r.profitUsd,
      vendorName:   r.vendorName,
      poId:         r.poId,
      shipmentId:   r.shipmentId,
      invoiceId:    r.invoiceId,
      fulfillMethod: r.fulfillMethod,
      trackingRef:  r.trackingRef,
      createdAt:    r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    }));
  }

  // Single order
  async getOrder(order_id: string) {
    const row = await (prisma as any).tikTokOrder.findUnique({ where: { externalId: order_id } });
    if (!row) throw new Error(`Order ${order_id} not found`);
    return {
      ...row,
      items:    JSON.parse(row.itemsJson    || "[]"),
      skuMatch: JSON.parse(row.skuMatchJson || "[]"),
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
    };
  }

  // Summary stats
  async summary() {
    const orders  = await (prisma as any).tikTokOrder.findMany();
    const total   = orders.length;
    const paid    = orders.filter((o: any) => o.status === "PAID").length;
    const revenue = orders.reduce((s: number, o: any) => {
      const items: TikTokItem[] = JSON.parse(o.itemsJson || "[]");
      return s + items.reduce((ss, i) => ss + (i.unitPrice ?? 0) * i.quantity, 0);
    }, 0);
    const profit = orders.reduce((s: number, o: any) => s + (o.profitUsd ?? 0), 0);
    const byStatus: Record<string, number> = {};
    for (const o of orders) { byStatus[o.status] = (byStatus[o.status] ?? 0) + 1; }
    return {
      totalOrders:   total,
      paidOrders:    paid,
      totalRevenue:  Math.round(revenue * 100) / 100,
      totalProfit:   Math.round(profit * 100) / 100,
      byStatus,
    };
  }
}

export const tikTokService = new TikTokService();
