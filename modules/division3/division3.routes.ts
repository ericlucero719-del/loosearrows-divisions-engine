// modules/division3/division3.routes.ts
// Division 3 — Requests & Work Orders
//
// Example requests:
//   POST /division/3/requests
//     Body: { "type": "RFQ", "requestorId": "user-001", "notes": "Urgent printer supplies" }
//     Response: { "id": "...", "status": "New", ... }
//
//   POST /division/3/requests/:id/products
//     Body: { "productIds": ["CF360A", "CF361A"] }
//
//   PUT /division/3/requests/:id/contract
//     Body: { "contractId": "..." }
//
//   PUT /division/3/requests/:id/status
//     Body: { "status": "Approved" }
//
//   GET /division/3/requests/:id
//     Response: full request with _products and _contract enrichment

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { division3Controller } from "./division3.controller";

const router = Router();

router.post(
  "/requests",
  operatorWorkflow("DIVISION-3", "CREATE_REQUEST"),
  division3Controller.createRequest
);

router.post(
  "/requests/:id/products",
  operatorWorkflow("DIVISION-3", "ATTACH_PRODUCTS"),
  division3Controller.attachProducts
);

router.put(
  "/requests/:id/contract",
  operatorWorkflow("DIVISION-3", "LINK_CONTRACT"),
  division3Controller.linkContract
);

router.put(
  "/requests/:id/status",
  operatorWorkflow("DIVISION-3", "UPDATE_REQUEST_STATUS"),
  division3Controller.updateStatus
);

router.get(
  "/requests",
  operatorWorkflow("DIVISION-3", "LIST_REQUESTS"),
  division3Controller.listRequests
);

router.get(
  "/requests/:id",
  operatorWorkflow("DIVISION-3", "GET_REQUEST"),
  division3Controller.getRequest
);

export default router;
