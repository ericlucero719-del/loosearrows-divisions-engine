// modules/tiktok/tiktok.routes.ts
// LooseArrows Supply & Logistics™ — TikTok Sales Automation Layer
//
// All routes require Operator-tier API key (X-API-Key header)
//
// POST   /tiktok/order              capture order → SKU match → profit calc → PO (auto-pipeline)
// POST   /tiktok/fulfill            trigger fulfillment (home: label + tracking | supplier: push)
// POST   /tiktok/invoice            generate invoice from order
// POST   /tiktok/payment            record payment, mark invoice PAID
// POST   /tiktok/notify             log event + update inventory
//
// GET    /tiktok/orders             list all orders (filter: ?status=RECEIVED|PO_SENT|FULFILLED|INVOICED|PAID)
// GET    /tiktok/orders/:order_id   get full order detail
// GET    /tiktok/summary            aggregate stats (revenue, profit, status breakdown)

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { tikTokController } from "./tiktok.controller";

const router = Router();

// ── Automation endpoints (mirror original 5-step design) ──────────────────────
router.post("/order",   operatorWorkflow("TIKTOK", "CAPTURE_ORDER"),   tikTokController.captureOrder);
router.post("/fulfill", operatorWorkflow("TIKTOK", "FULFILL_ORDER"),   tikTokController.fulfill);
router.post("/invoice", operatorWorkflow("TIKTOK", "INVOICE_ORDER"),   tikTokController.invoice);
router.post("/payment", operatorWorkflow("TIKTOK", "RECORD_PAYMENT"),  tikTokController.payment);
router.post("/notify",  operatorWorkflow("TIKTOK", "NOTIFY_AND_SYNC"), tikTokController.notify);

// ── Query endpoints ────────────────────────────────────────────────────────────
router.get("/summary",             operatorWorkflow("TIKTOK", "SUMMARY"),   tikTokController.summary);
router.get("/orders",              operatorWorkflow("TIKTOK", "LIST"),       tikTokController.listOrders);
router.get("/orders/:order_id",    operatorWorkflow("TIKTOK", "GET_ORDER"),  tikTokController.getOrder);

export default router;
