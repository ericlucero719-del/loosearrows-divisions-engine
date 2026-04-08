"use strict";
// modules/commerce/commerce.routes.ts
// LooseArrows Supply & Logistics™
// Shared router factory — one function generates a full platform router
//
// POST   /<platform>/order              capture → SKU match → profit → PO
// POST   /<platform>/fulfill            home (label+tracking) | supplier push
// POST   /<platform>/invoice            generate Division 9 invoice
// POST   /<platform>/payment            record payment, mark invoice PAID
// POST   /<platform>/notify             log event + sync Division 1 inventory
// GET    /<platform>/orders             list all orders (?status= filter)
// GET    /<platform>/orders/:order_id   full order detail
// GET    /<platform>/summary            revenue / profit / status breakdown
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCommerceRouter = makeCommerceRouter;
const express_1 = require("express");
const engine_1 = require("../../src/core/engine");
const commerce_service_1 = require("./commerce.service");
const commerce_controller_1 = require("./commerce.controller");
function makeCommerceRouter(cfg) {
    const svc = commerce_service_1.CommerceService.forPlatform(cfg);
    const ctrl = (0, commerce_controller_1.makeCommerceController)(svc);
    const P = cfg.platform;
    const router = (0, express_1.Router)();
    router.post("/order", (0, engine_1.operatorWorkflow)(P, "CAPTURE_ORDER"), ctrl.captureOrder);
    router.post("/fulfill", (0, engine_1.operatorWorkflow)(P, "FULFILL_ORDER"), ctrl.fulfill);
    router.post("/invoice", (0, engine_1.operatorWorkflow)(P, "INVOICE_ORDER"), ctrl.invoice);
    router.post("/payment", (0, engine_1.operatorWorkflow)(P, "RECORD_PAYMENT"), ctrl.payment);
    router.post("/notify", (0, engine_1.operatorWorkflow)(P, "NOTIFY_AND_SYNC"), ctrl.notify);
    router.get("/summary", (0, engine_1.operatorWorkflow)(P, "SUMMARY"), ctrl.summary);
    router.get("/orders", (0, engine_1.operatorWorkflow)(P, "LIST"), ctrl.listOrders);
    router.get("/orders/:order_id", (0, engine_1.operatorWorkflow)(P, "GET_ORDER"), ctrl.getOrder);
    return router;
}
//# sourceMappingURL=commerce.routes.js.map