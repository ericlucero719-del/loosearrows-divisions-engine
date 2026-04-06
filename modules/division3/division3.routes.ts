// modules/division3/division3.routes.ts
// Division 3 — Requests, Work Orders & Bid Pipeline
//
// ── Work Request routes ────────────────────────────────────────────────────────
//   POST   /division/3/requests
//   POST   /division/3/requests/:id/products
//   PUT    /division/3/requests/:id/contract
//   PUT    /division/3/requests/:id/status
//   GET    /division/3/requests
//   GET    /division/3/requests/:id
//
// ── Bid Pipeline routes ────────────────────────────────────────────────────────
//   GET    /division/3/bid-pipeline
//     Returns all active Division 2 contracts open for bidding
//
//   POST   /division/3/bids
//     Body: { "contractId":"...", "vendorId":"vendor-001", "vendorName":"ACME Corp",
//             "lineItems":[{ "sku":"CF360A","quantity":10,"unitPrice":130,"clin":"CLIN-001" }] }
//     Omit lineItems to auto-populate from contract catalog
//
//   GET    /division/3/bids              ?status=DRAFT|SUBMITTED|UNDER_REVIEW|AWARDED|LOST|WITHDRAWN
//   GET    /division/3/bids/:id          enriched with _contract and _quote
//
//   POST   /division/3/bids/:id/line-items   replace line items (DRAFT only)
//   POST   /division/3/bids/:id/quote        generate Division 9 quote (idempotent)
//   POST   /division/3/bids/:id/submit       DRAFT → SUBMITTED, quote → Sent
//   PATCH  /division/3/bids/:id/status       Body: { "status": "AWARDED" | "LOST" | "WITHDRAWN" }

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { division3Controller } from "./division3.controller";

const router = Router();

// ── Work Requests ──────────────────────────────────────────────────────────────
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

// ── Bid Pipeline ───────────────────────────────────────────────────────────────
router.get(
  "/bid-pipeline",
  operatorWorkflow("DIVISION-3", "GET_BID_PIPELINE"),
  division3Controller.getBidPipeline
);

router.post(
  "/bids",
  operatorWorkflow("DIVISION-3", "CREATE_BID"),
  division3Controller.createBid
);

router.get(
  "/bids",
  operatorWorkflow("DIVISION-3", "LIST_BIDS"),
  division3Controller.listBids
);

router.get(
  "/bids/:id",
  operatorWorkflow("DIVISION-3", "GET_BID"),
  division3Controller.getBid
);

router.post(
  "/bids/:id/line-items",
  operatorWorkflow("DIVISION-3", "SET_BID_LINE_ITEMS"),
  division3Controller.setLineItems
);

router.post(
  "/bids/:id/quote",
  operatorWorkflow("DIVISION-3", "GENERATE_BID_QUOTE"),
  division3Controller.generateQuote
);

router.post(
  "/bids/:id/submit",
  operatorWorkflow("DIVISION-3", "SUBMIT_BID"),
  division3Controller.submitBid
);

router.patch(
  "/bids/:id/status",
  operatorWorkflow("DIVISION-3", "UPDATE_BID_STATUS"),
  division3Controller.updateBidStatus
);

export default router;
