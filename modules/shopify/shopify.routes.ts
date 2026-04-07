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

import { Router, json } from "express";
import { requireApiKey } from "../../src/middleware/apiKey";
import { operatorWorkflow } from "../../src/core/engine";
import { shopifyController } from "./shopify.controller";

const router = Router();

// ── Public webhook (no API key — HMAC signature verifies it) ─────────────────
router.post(
  "/webhook",
  json({
    verify: (req: any, _res, buf) => { req.rawBody = buf; },
  }),
  shopifyController.webhook,
);

// ── Key-gated endpoints ───────────────────────────────────────────────────────
router.use(requireApiKey);

router.get("/store",                         operatorWorkflow("SHOPIFY", "STORE_INFO"),  shopifyController.storeInfo);
router.post("/sync",                         operatorWorkflow("SHOPIFY", "SYNC_ORDERS"), shopifyController.syncOrders);
router.post("/sync/:shopify_id",             operatorWorkflow("SHOPIFY", "SYNC_ONE"),    shopifyController.syncOne);
router.get("/summary",                       operatorWorkflow("SHOPIFY", "SUMMARY"),     shopifyController.summary);
router.get("/orders",                        operatorWorkflow("SHOPIFY", "LIST"),         shopifyController.listOrders);
router.get("/orders/:order_id",              operatorWorkflow("SHOPIFY", "GET_ORDER"),   shopifyController.getOrder);

export default router;
