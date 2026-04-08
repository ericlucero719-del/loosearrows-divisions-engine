"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../prisma");
const division2Service_1 = require("../division2/services/division2Service");
const catalogLoader_1 = require("../services/catalogLoader");
const catalogRegistry_1 = require("../services/catalogRegistry");
const schemas_1 = require("../division2/validation/schemas");
const router = express_1.default.Router();
/**
 * Middleware: Require Store Auth
 */
async function requireStoreAuth(req, res, next) {
    const authHeader = String(req.headers.authorization ?? "");
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : req.headers["x-store-token"];
    if (!token) {
        return res.status(401).json({ error: "Missing authorization token" });
    }
    const store = await (0, division2Service_1.getStoreByToken)(token);
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
    const parsed = schemas_1.storeRegisterSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }
    const store = await (0, division2Service_1.createStore)(parsed.data);
    return res.json(store);
});
/**
 * Update Store Settings
 */
router.post("/store/settings", requireStoreAuth, async (req, res) => {
    const parsed = schemas_1.storeSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }
    const updated = await (0, division2Service_1.updateStoreSettings)(req.store.id, parsed.data.settings);
    return res.json(updated);
});
/**
 * Create Supplier
 */
router.post("/suppliers", requireStoreAuth, async (req, res) => {
    const parsed = schemas_1.createSupplierSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }
    const supplier = await (0, division2Service_1.createSupplier)(req.store.id, parsed.data.supplier);
    return res.json(supplier);
});
/**
 * List Suppliers
 */
router.get("/suppliers", requireStoreAuth, async (req, res) => {
    const suppliers = await (0, division2Service_1.listSuppliers)(req.store.id);
    return res.json(suppliers);
});
/**
 * Auto-Fulfill Order
 */
router.post("/auto-fulfill", requireStoreAuth, async (req, res) => {
    const parsed = schemas_1.supplierMatchInputSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }
    const result = await (0, division2Service_1.matchAndSelectSupplier)(parsed.data);
    return res.json(result);
});
/**
 * Generate Purchase Order
 */
router.post("/generate-po", requireStoreAuth, async (req, res) => {
    const parsed = schemas_1.purchaseOrderRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }
    const po = await (0, division2Service_1.createPurchaseOrderRecord)({ ...parsed.data, storeId: req.store.id });
    return res.json(po);
});
/**
 * Update Tracking
 */
router.post("/update-tracking", requireStoreAuth, async (req, res) => {
    const parsed = schemas_1.trackingUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }
    const updated = await (0, division2Service_1.updateTracking)(parsed.data.orderId, parsed.data);
    return res.json(updated);
});
/**
 * Close Order
 */
router.post("/close-order", requireStoreAuth, async (req, res) => {
    const storeId = req.store?.id;
    const { orderId, status } = req.body;
    if (!storeId || !orderId) {
        return res.status(400).json({ error: "store and orderId are required" });
    }
    const order = await prisma_1.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.storeId !== storeId) {
        return res.status(404).json({ error: "order not found" });
    }
    const updated = await prisma_1.prisma.order.update({
        where: { id: orderId },
        data: { status: status ?? "closed" },
    });
    (0, division2Service_1.addLog)("Order closed", { orderId, status: updated.status });
    return res.json({ order: updated });
});
/**
 * Get Orders
 */
router.get("/orders", requireStoreAuth, async (req, res) => {
    const storeId = req.store?.id;
    const orders = await prisma_1.prisma.order.findMany({
        where: { storeId },
        include: { items: true, tracking: true },
    });
    return res.json(orders.map((o) => ({
        ...o,
        customer: JSON.parse(o.customerJson ?? "{}"),
    })));
});
/**
 * Get Logs
 */
router.get("/logs", requireStoreAuth, (req, res) => {
    return res.json(division2Service_1.logs);
});
/**
 * ⭐ LOAD CATALOG (NEW)
 */
router.post("/load-catalog", requireStoreAuth, async (req, res) => {
    const store = req.store;
    // Resolve Shopify credentials: body override → DB settings → env var
    const { storeDomain: bodyDomain, accessToken: bodyToken } = req.body ?? {};
    let resolvedDomain = bodyDomain;
    let resolvedToken = bodyToken;
    if (!resolvedDomain || !resolvedToken) {
        const { prisma: db } = await Promise.resolve().then(() => __importStar(require("../prisma")));
        const storeSettings = await db.storeSettings.findUnique({ where: { storeId: store.id } });
        if (storeSettings?.integrationsJson) {
            try {
                const integrations = JSON.parse(storeSettings.integrationsJson);
                resolvedDomain = resolvedDomain ?? integrations?.shopify?.storeDomain;
                resolvedToken = resolvedToken ?? integrations?.shopify?.accessToken;
            }
            catch { /* ignore parse errors */ }
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
    const result = await (0, catalogLoader_1.fetchShopifyProducts)({ storeDomain: resolvedDomain, accessToken: resolvedToken });
    if (!result.ok) {
        return res.status(502).json({
            message: "Shopify API rejected the request. The access token may be invalid or the store may be on a paused plan.",
            error: result.error,
            storeDomain: resolvedDomain,
            hint: "Generate a new Custom App token in your Shopify Admin → Apps → Develop apps, then update your SHOPIFY_ACCESS_TOKEN secret.",
        });
    }
    const normalized = result.products.map(catalogLoader_1.normalizeProduct);
    const saved = (0, catalogRegistry_1.saveCatalog)(store.id, normalized);
    return res.json({
        message: "Catalog loaded",
        storeDomain: resolvedDomain,
        count: normalized.length,
        catalog: saved,
    });
});
exports.default = router;
//# sourceMappingURL=division2.js.map