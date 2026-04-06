import express from "express";
import { prisma } from "../prisma";
import {
  addLog,
  createOrder,
  createPurchaseOrderRecord,
  createStore,
  createSupplier,
  getStoreByToken,
  listSuppliers,
  loadCatalog,
  logs,
  matchAndSelectSupplier,
  poEngine,
  updateStoreSettings,
  updateTracking,
} from "../division2/services/division2Service";

import { fetchShopifyProducts, normalizeProduct } from "../services/catalogLoader";
import { saveCatalog } from "../services/catalogRegistry";

import {
  PurchaseOrderRequest,
  SupplierMatchInput,
  TrackingUpdate,
} from "../division2/types";

import {
  createSupplierSchema,
  loadCatalogSchema,
  purchaseOrderRequestSchema,
  storeRegisterSchema,
  storeSettingsSchema,
  supplierMatchInputSchema,
  trackingUpdateSchema,
} from "../division2/validation/schemas";

const router = express.Router();

interface AuthenticatedRequest extends express.Request {
  store?: any;
}

/**
 * Middleware: Require Store Auth
 */
async function requireStoreAuth(
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = String(req.headers.authorization ?? "");
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : (req.headers["x-store-token"] as string);

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const store = await getStoreByToken(token);
  if (!store) {
    return res.status(401).json({ error: "Invalid store token" });
  }

  req.store = store;
  next();
}

/**
 * Register Store
 */
router.post("/store/register", async (req, res) => {
  const parsed = storeRegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const store = await createStore(parsed.data);
  return res.json(store);
});

/**
 * Update Store Settings
 */
router.post("/store/settings", requireStoreAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = storeSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const updated = await updateStoreSettings(req.store!.id, parsed.data.settings as Record<string, unknown>);
  return res.json(updated);
});

/**
 * Create Supplier
 */
router.post("/suppliers", requireStoreAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = createSupplierSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const supplier = await createSupplier(req.store!.id, parsed.data.supplier as any);
  return res.json(supplier);
});

/**
 * List Suppliers
 */
router.get("/suppliers", requireStoreAuth, async (req: AuthenticatedRequest, res) => {
  const suppliers = await listSuppliers(req.store!.id);
  return res.json(suppliers);
});

/**
 * Auto-Fulfill Order
 */
router.post("/auto-fulfill", requireStoreAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = supplierMatchInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const result = await matchAndSelectSupplier(parsed.data);
  return res.json(result);
});

/**
 * Generate Purchase Order
 */
router.post("/generate-po", requireStoreAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = purchaseOrderRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const po = await createPurchaseOrderRecord({ ...parsed.data, storeId: req.store!.id });
  return res.json(po);
});

/**
 * Update Tracking
 */
router.post("/update-tracking", requireStoreAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = trackingUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const updated = await updateTracking(parsed.data.orderId, parsed.data);
  return res.json(updated);
});

/**
 * Close Order
 */
router.post("/close-order", requireStoreAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = req.store?.id;
  const { orderId, status } = req.body as { orderId: string; status?: string };

  if (!storeId || !orderId) {
    return res.status(400).json({ error: "store and orderId are required" });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.storeId !== storeId) {
    return res.status(404).json({ error: "order not found" });
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: status ?? "closed" },
  });

  addLog("Order closed", { orderId, status: updated.status });
  return res.json({ order: updated });
});

/**
 * Get Orders
 */
router.get("/orders", requireStoreAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = req.store?.id;

  const orders = await prisma.order.findMany({
    where: { storeId },
    include: { items: true, tracking: true },
  });

  return res.json(
    orders.map((o) => ({
      ...o,
      customer: JSON.parse(o.customerJson ?? "{}"),
    }))
  );
});

/**
 * Get Logs
 */
router.get("/logs", requireStoreAuth, (req, res) => {
  return res.json(logs);
});

/**
 * ⭐ LOAD CATALOG (NEW)
 */
router.post("/load-catalog", requireStoreAuth, async (req: AuthenticatedRequest, res) => {
  const store = req.store;

  // Resolve Shopify credentials: body override → DB settings → env var
  const { storeDomain: bodyDomain, accessToken: bodyToken } = req.body ?? {};

  let resolvedDomain: string | undefined = bodyDomain;
  let resolvedToken: string | undefined = bodyToken;

  if (!resolvedDomain || !resolvedToken) {
    const { prisma: db } = await import("../prisma");
    const storeSettings = await db.storeSettings.findUnique({ where: { storeId: store.id } });
    if (storeSettings?.integrationsJson) {
      try {
        const integrations = JSON.parse(storeSettings.integrationsJson);
        resolvedDomain = resolvedDomain ?? integrations?.shopify?.storeDomain;
        resolvedToken  = resolvedToken  ?? integrations?.shopify?.accessToken;
      } catch { /* ignore parse errors */ }
    }
  }

  // Final fallback: env var token
  resolvedToken = resolvedToken ?? process.env.SHOPIFY_ACCESS_TOKEN;

  if (!resolvedDomain) {
    return res.status(400).json({
      message: "Shopify store domain not configured. Pass storeDomain in the request body or configure it via POST /division2/store/settings.",
    });
  }
  if (!resolvedToken) {
    return res.status(400).json({
      message: "No Shopify access token available. Set SHOPIFY_ACCESS_TOKEN environment secret or configure via POST /division2/store/settings.",
    });
  }

  const result = await fetchShopifyProducts({ storeDomain: resolvedDomain, accessToken: resolvedToken });

  if (!result.ok) {
    return res.status(502).json({
      message: "Shopify API rejected the request. The access token may be invalid or the store may be on a paused plan.",
      error: result.error,
      storeDomain: resolvedDomain,
      hint: "Generate a new Custom App token in your Shopify Admin → Apps → Develop apps, then update your SHOPIFY_ACCESS_TOKEN secret.",
    });
  }

  const normalized = result.products.map(normalizeProduct);
  const saved = saveCatalog(store.id, normalized);

  return res.json({
    message: "Catalog loaded",
    storeDomain: resolvedDomain,
    count: normalized.length,
    catalog: saved,
  });
});

export default router;
