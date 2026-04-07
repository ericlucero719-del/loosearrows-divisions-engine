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

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { CommerceService, PlatformConfig } from "./commerce.service";
import { makeCommerceController } from "./commerce.controller";

export function makeCommerceRouter(cfg: PlatformConfig): Router {
  const svc        = CommerceService.forPlatform(cfg);
  const ctrl       = makeCommerceController(svc);
  const P          = cfg.platform;
  const router     = Router();

  router.post("/order",   operatorWorkflow(P, "CAPTURE_ORDER"),   ctrl.captureOrder);
  router.post("/fulfill", operatorWorkflow(P, "FULFILL_ORDER"),   ctrl.fulfill);
  router.post("/invoice", operatorWorkflow(P, "INVOICE_ORDER"),   ctrl.invoice);
  router.post("/payment", operatorWorkflow(P, "RECORD_PAYMENT"),  ctrl.payment);
  router.post("/notify",  operatorWorkflow(P, "NOTIFY_AND_SYNC"), ctrl.notify);

  router.get("/summary",            operatorWorkflow(P, "SUMMARY"),   ctrl.summary);
  router.get("/orders",             operatorWorkflow(P, "LIST"),       ctrl.listOrders);
  router.get("/orders/:order_id",   operatorWorkflow(P, "GET_ORDER"),  ctrl.getOrder);

  return router;
}
