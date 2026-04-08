"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const engine_1 = require("../../src/core/engine");
const tiktok_controller_1 = require("./tiktok.controller");
const router = (0, express_1.Router)();
// ── Automation endpoints (mirror original 5-step design) ──────────────────────
router.post("/order", (0, engine_1.operatorWorkflow)("TIKTOK", "CAPTURE_ORDER"), tiktok_controller_1.tikTokController.captureOrder);
router.post("/fulfill", (0, engine_1.operatorWorkflow)("TIKTOK", "FULFILL_ORDER"), tiktok_controller_1.tikTokController.fulfill);
router.post("/invoice", (0, engine_1.operatorWorkflow)("TIKTOK", "INVOICE_ORDER"), tiktok_controller_1.tikTokController.invoice);
router.post("/payment", (0, engine_1.operatorWorkflow)("TIKTOK", "RECORD_PAYMENT"), tiktok_controller_1.tikTokController.payment);
router.post("/notify", (0, engine_1.operatorWorkflow)("TIKTOK", "NOTIFY_AND_SYNC"), tiktok_controller_1.tikTokController.notify);
// ── Query endpoints ────────────────────────────────────────────────────────────
router.get("/summary", (0, engine_1.operatorWorkflow)("TIKTOK", "SUMMARY"), tiktok_controller_1.tikTokController.summary);
router.get("/orders", (0, engine_1.operatorWorkflow)("TIKTOK", "LIST"), tiktok_controller_1.tikTokController.listOrders);
router.get("/orders/:order_id", (0, engine_1.operatorWorkflow)("TIKTOK", "GET_ORDER"), tiktok_controller_1.tikTokController.getOrder);
exports.default = router;
//# sourceMappingURL=tiktok.routes.js.map