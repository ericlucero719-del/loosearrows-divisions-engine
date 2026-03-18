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

import { storeAuth } from "../middleware/storeAuth";
import { fetchShopifyProducts, normalizeProduct } from "../services/catalogLoader";
import { saveCatalog, getCatalog } from "../services/catalogRegistry";

import {
  PurchaseOrderRequest,
  SupplierMatchInput,
  TrackingUpdate,
  StoreRegistryEntry,
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
  store?: StoreRegistryEntry;
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

  const updated = await updateStoreSettings(req.store!.id, parsed.data);
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

  const supplier = await createSupplier(req.store!.id, parsed.data);
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

  const result = await matchAndSelectSupplier(req.store!.id, parsed.data);
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

  const po = await createPurchaseOrderRecord(req.store!.id, parsed.data);
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

  const updated = await updateTracking(req.store!.id, parsed.data);
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

  const integration = store?.integrations?.shopify;
  if (!integration) {
    return res.status(400).json({ message: "Store not connected to Shopify" });
  }

  const { storeDomain, accessToken } = integration;

  const result = await fetchShopifyProducts({ storeDomain, accessToken });

  if (!result.ok) {
    return res.status(500).json({
      message: "Failed to fetch products from Shopify",
      error: result.error,
    });
  }

  const normalized = result.products.map(normalizeProduct);
  const saved = saveCatalog(store.id, normalized);

  return res.json({
    message: "Catalog loaded",
    count: normalized.length,
    catalog: saved,
  });
});

export default router;
