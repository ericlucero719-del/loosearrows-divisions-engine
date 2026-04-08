"use strict";
// modules/shopify/shopify.routes.ts
// LooseArrows Supply & Logistics™ — Shopify Connector
//
// POST   /api/shopify/webhook            receive Shopify webhooks (public — HMAC verified)
// GET    /api/shopify/store              Shopify store info
// POST   /api/shopify/sync              sync recent Shopify orders (?limit=)
// POST   /api/shopify/sync/:shopify_id  sync single Shopify order by ID
// GET    /api/shopify/orders            list synced orders
// GET    /api/shopify/orders/:order_id  single order detail
// GET    /api/shopify/summary           Shopify revenue/profit/status breakdown
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiKey_1 = require("../../src/middleware/apiKey");
const engine_1 = require("../../src/core/engine");
const shopify_controller_1 = require("./shopify.controller");
const router = (0, express_1.Router)();
// ── Public webhook (no API key — HMAC signature verifies it) ─────────────────
router.post("/webhook", (0, express_1.json)({
    verify: (req, _res, buf) => { req.rawBody = buf; },
}), shopify_controller_1.shopifyController.webhook);
// ── Key-gated endpoints ───────────────────────────────────────────────────────
router.use(apiKey_1.requireApiKey);
router.get("/store", (0, engine_1.operatorWorkflow)("SHOPIFY", "STORE_INFO"), shopify_controller_1.shopifyController.storeInfo);
router.post("/sync", (0, engine_1.operatorWorkflow)("SHOPIFY", "SYNC_ORDERS"), shopify_controller_1.shopifyController.syncOrders);
router.post("/sync/:shopify_id", (0, engine_1.operatorWorkflow)("SHOPIFY", "SYNC_ONE"), shopify_controller_1.shopifyController.syncOne);
router.get("/summary", (0, engine_1.operatorWorkflow)("SHOPIFY", "SUMMARY"), shopify_controller_1.shopifyController.summary);
router.get("/orders", (0, engine_1.operatorWorkflow)("SHOPIFY", "LIST"), shopify_controller_1.shopifyController.listOrders);
router.get("/orders/:order_id", (0, engine_1.operatorWorkflow)("SHOPIFY", "GET_ORDER"), shopify_controller_1.shopifyController.getOrder);
exports.default = router;
//# sourceMappingURL=shopify.routes.js.map