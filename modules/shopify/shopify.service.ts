// modules/shopify/shopify.service.ts
// LooseArrows Supply & Logistics™ — Shopify Connector
// Pulls orders from Shopify Admin REST API and routes them through
// the shared CommerceService pipeline (platform="SHOPIFY").

import { PrismaClient } from "@prisma/client";
import { CommerceService } from "../commerce/commerce.service";

const prisma = new PrismaClient();

const STORE  = process.env.SHOPIFY_STORE_DOMAIN ?? "";
const TOKEN  = process.env.SHOPIFY_ACCESS_TOKEN ?? "";
const BASE   = `https://${STORE}/admin/api/2024-01`;

const svc = CommerceService.forPlatform({
  platform: "SHOPIFY",
  prefix:   "SHO",
  label:    "Shopify Commerce",
});

// ─── Shopify REST helpers ─────────────────────────────────────────────────────

async function shopifyGet(path: string): Promise<any> {
  if (!TOKEN || !STORE) {
    throw new Error("SHOPIFY_ACCESS_TOKEN and SHOPIFY_STORE_DOMAIN must be configured as environment variables.");
  }
  const res  = await fetch(`${BASE}${path}`, {
    headers: { "X-Shopify-Access-Token": TOKEN, "Content-Type": "application/json" },
  });
  const body = await res.text();
  const data = JSON.parse(body);
  if (!res.ok || data.errors) {
    throw new Error(
      `Shopify API error ${res.status} for store "${STORE}". ` +
      `Verify SHOPIFY_STORE_DOMAIN (e.g. mystore.myshopify.com) and that SHOPIFY_ACCESS_TOKEN has read_orders scope. ` +
      `Detail: ${JSON.stringify(data.errors)}`
    );
  }
  return data;
}

// ─── Map Shopify order → CommerceOrderPayload ─────────────────────────────────

function mapShopifyOrder(order: any) {
  return {
    order_id: `SHO-${order.id}`,
    channel:  order.source_name ?? "shopify",
    notes:    `Shopify order #${order.order_number} | customer: ${order.email ?? "unknown"}`,
    items: (order.line_items ?? []).map((li: any) => ({
      sku:       li.sku || `SHOPIFY-${li.variant_id}`,
      quantity:  li.quantity,
      unitPrice: parseFloat(li.price),
      name:      li.title,
    })),
  };
}

// ─── Service Methods ──────────────────────────────────────────────────────────

export const shopifyService = {

  // Fetch recent Shopify orders and sync any not already in CommerceOrder
  async syncOrders(limit = 50): Promise<{ synced: number; skipped: number; errors: string[] }> {
    if (!TOKEN || !STORE) throw new Error("SHOPIFY_ACCESS_TOKEN and SHOPIFY_STORE_DOMAIN must be set");

    const data   = await shopifyGet(`/orders.json?status=any&limit=${limit}`);
    const orders = data.orders ?? [];
    let synced = 0, skipped = 0;
    const errors: string[] = [];

    for (const order of orders) {
      const externalId = `SHO-${order.id}`;
      const existing   = await (prisma as any).commerceOrder.findFirst({
        where: { platform: "SHOPIFY", externalId },
      });
      if (existing) { skipped++; continue; }
      if (!order.line_items?.length) { skipped++; continue; }

      try {
        await svc.captureOrder(mapShopifyOrder(order));
        synced++;
      } catch (e: any) {
        errors.push(`Order ${externalId}: ${e.message}`);
      }
    }

    return { synced, skipped, errors };
  },

  // Sync a single Shopify order by its Shopify ID
  async syncOne(shopifyOrderId: string) {
    if (!TOKEN || !STORE) throw new Error("SHOPIFY_ACCESS_TOKEN and SHOPIFY_STORE_DOMAIN must be set");
    const data    = await shopifyGet(`/orders/${shopifyOrderId}.json`);
    const order   = data.order;
    if (!order) throw new Error(`Shopify order ${shopifyOrderId} not found`);
    return svc.captureOrder(mapShopifyOrder(order));
  },

  // Process a Shopify webhook payload (order/created)
  async processWebhook(topic: string, body: any) {
    if (topic === "orders/create" || topic === "orders/paid") {
      if (!body.line_items?.length) return { status: "skipped", reason: "no line items" };
      return svc.captureOrder(mapShopifyOrder(body));
    }
    if (topic === "orders/fulfilled") {
      const externalId = `SHO-${body.id}`;
      const order = await (prisma as any).commerceOrder.findFirst({
        where: { platform: "SHOPIFY", externalId },
      });
      if (order) {
        await (prisma as any).commerceOrder.update({
          where: { orderId: order.orderId },
          data:  { status: "FULFILLED", fulfillMethod: "shopify", trackingRef: body.fulfillments?.[0]?.tracking_number ?? null },
        });
      }
      return { status: "fulfilled", externalId };
    }
    return { status: "ignored", topic };
  },

  // Shopify-specific summary
  async summary() {
    return svc.summary();
  },

  // List Shopify orders
  async listOrders(status?: string) {
    return svc.listOrders(status);
  },

  // Get single order
  async getOrder(orderId: string) {
    return svc.getOrder(orderId);
  },

  // Get Shopify store info
  async storeInfo() {
    if (!TOKEN || !STORE) throw new Error("SHOPIFY_ACCESS_TOKEN and SHOPIFY_STORE_DOMAIN must be set");
    const data = await shopifyGet("/shop.json");
    return {
      name:     data.shop?.name,
      domain:   data.shop?.domain,
      email:    data.shop?.email,
      currency: data.shop?.currency,
      plan:     data.shop?.plan_name,
    };
  },
};
