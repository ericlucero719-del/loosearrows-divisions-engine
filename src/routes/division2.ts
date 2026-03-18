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
import storeAuth from "../../middleware/storeAuth";
import { fetchShopifyProducts, normalizeProduct } from "../../services/catalogLoader";
import { saveCatalog } from "../../services/catalogRegistry";
import { PurchaseOrderRequest, SupplierMatchInput, TrackingUpdate, StoreRegistryEntry } from "../division2/types";
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

async function requireStoreAuth(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = String(req.headers.authorization ?? "");
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : (req.headers["x-store-token"] as string);
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

router.post("/store/register", async (req, res) => {
  const parsed = storeRegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", issues: parsed.error.format() });
  }

  const store = await createStore(parsed.data);
  return res.json({ store });
});

// Require store auth for all subsequent Division 2 endpoints
router.use(requireStoreAuth);

router.post("/store/settings", async (req: AuthenticatedRequest, res) => {
  const storeId = req.store?.id;

  const parsed = storeSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", issues: parsed.error.format() });
  }

  const updated = await updateStoreSettings(storeId, parsed.data.settings);
  if (!updated) {
    return res.status(404).json({ error: "store not found" });
  }
  return res.json({ store: updated });
});

router.post("/load-catalog", async (req: AuthenticatedRequest, res) => {
  const storeId = req.store?.id;

  const parsed = loadCatalogSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", issues: parsed.error.format() });
  }

  const catalog = await loadCatalog(storeId, parsed.data.products);
  if (!catalog) {
    return res.status(404).json({ error: "store not found" });
  }

  return res.json({ catalog });
});

router.post("/build-store", (req, res) => {
  const { storeId } = req.body as { storeId: string };
  if (!storeId) {
    return res.status(400).json({ error: "storeId is required" });
  }

  addLog("Store build started", { storeId });

  return res.json({
    message: "Store build triggered",
    storeId,
    steps: [
      "Catalog loaded",
      "Product Generator",
      "Collection Builder",
      "Navigation Builder",
      "Page Generator",
      "Theme Configurator",
    ],
  });
});

router.post("/suppliers", async (req: AuthenticatedRequest, res) => {
  const storeId = req.store?.id;

  const parsed = createSupplierSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", issues: parsed.error.format() });
  }

  const created = await createSupplier(storeId, parsed.data.supplier);
  return res.json({ supplier: created });
});

router.get("/suppliers", async (req: AuthenticatedRequest, res) => {
  const storeId = req.store?.id;
  const suppliers = await listSuppliers(storeId);
  return res.json(suppliers);
});

router.post("/auto-fulfill", async (req: AuthenticatedRequest, res) => {
  const storeId = req.store?.id;
  const payload = req.body as {
    order: PurchaseOrderRequest;
    matchInput: SupplierMatchInput;
  };

  if (!storeId || !payload?.order || !payload.matchInput) {
    return res.status(400).json({ error: "store, order and matchInput are required" });
  }

  const orderPayloadParse = purchaseOrderRequestSchema.safeParse(payload.order);
  const matchInputParse = supplierMatchInputSchema.safeParse(payload.matchInput);

  if (!orderPayloadParse.success || !matchInputParse.success) {
    return res.status(400).json({
      error: "Invalid request",
      issues: {
        order: orderPayloadParse.success ? null : orderPayloadParse.error.format(),
        matchInput: matchInputParse.success ? null : matchInputParse.error.format(),
      },
    });
  }

  const order = await createOrder({
    ...orderPayloadParse.data,
    storeId,
    status: "pending",
  });

  const { match, failure } = await matchAndSelectSupplier(matchInputParse.data);
  if (failure) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "needs_review" } });
    return res.status(200).json({ match: null, failure });
  }

  const poResult = await poEngine.createPurchaseOrder(match!, payload.order);
  await createPurchaseOrderRecord({
    poNumber: poResult.poNumber,
    orderId: order.id,
    supplierId: match!.supplierId,
    shippingMethod: match!.supplierShippingMethod,
    notes: payload.order.notes,
    status: poResult.status,
  });

  await prisma.order.update({ where: { id: order.id }, data: { status: "po_created" } });

  return res.json({ match, poResult });
});

router.post("/generate-po", async (req, res) => {
  const payload = req.body as {
    match: any;
    order: PurchaseOrderRequest;
  };

  if (!payload?.match || !payload.order) {
    return res.status(400).json({ error: "match and order are required" });
  }

  const poResult = await poEngine.createPurchaseOrder(payload.match, payload.order);
  return res.json(poResult);
});

router.post("/update-tracking", async (req: AuthenticatedRequest, res) => {
  const update = req.body as TrackingUpdate;
  if (!update?.orderId) {
    return res.status(400).json({ error: "orderId is required" });
  }

  const parsed = trackingUpdateSchema.safeParse(update);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", issues: parsed.error.format() });
  }

  const normalized = await updateTracking(parsed.data.orderId, parsed.data);
  addLog("Tracking updated", { orderId: parsed.data.orderId, normalized });
  return res.json(normalized);
});

router.post("/close-order", async (req: AuthenticatedRequest, res) => {
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

router.get("/orders", async (req: AuthenticatedRequest, res) => {
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

router.get("/logs", (req, res) => {
  return res.json(logs);
});

export default router;
