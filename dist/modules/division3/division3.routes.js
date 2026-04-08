"use strict";
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
//   POST   /division/3/bids
//   GET    /division/3/bids              ?status=DRAFT|SUBMITTED|UNDER_REVIEW|AWARDED|LOST|WITHDRAWN
//   GET    /division/3/bids/:id
//   POST   /division/3/bids/:id/line-items   replace line items (DRAFT only)
//   PATCH  /division/3/bids/:id/pricing      update unit prices (any pre-award status)
//   POST   /division/3/bids/:id/quote        generate Division 9 quote (idempotent)
//   POST   /division/3/bids/:id/submit       DRAFT → SUBMITTED, quote → Sent
//   PATCH  /division/3/bids/:id/status       Body: { "status": "AWARDED" | "LOST" | "WITHDRAWN" }
//   GET    /division/3/bids/:id/submission   HTML capability statement / price list for printing
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const engine_1 = require("../../src/core/engine");
const division3_controller_1 = require("./division3.controller");
const router = (0, express_1.Router)();
// ── Work Requests ──────────────────────────────────────────────────────────────
router.post("/requests", (0, engine_1.operatorWorkflow)("DIVISION-3", "CREATE_REQUEST"), division3_controller_1.division3Controller.createRequest);
router.post("/requests/:id/products", (0, engine_1.operatorWorkflow)("DIVISION-3", "ATTACH_PRODUCTS"), division3_controller_1.division3Controller.attachProducts);
router.put("/requests/:id/contract", (0, engine_1.operatorWorkflow)("DIVISION-3", "LINK_CONTRACT"), division3_controller_1.division3Controller.linkContract);
router.put("/requests/:id/status", (0, engine_1.operatorWorkflow)("DIVISION-3", "UPDATE_REQUEST_STATUS"), division3_controller_1.division3Controller.updateStatus);
router.get("/requests", (0, engine_1.operatorWorkflow)("DIVISION-3", "LIST_REQUESTS"), division3_controller_1.division3Controller.listRequests);
router.get("/requests/:id", (0, engine_1.operatorWorkflow)("DIVISION-3", "GET_REQUEST"), division3_controller_1.division3Controller.getRequest);
// ── Bid Pipeline ───────────────────────────────────────────────────────────────
router.get("/bid-pipeline", (0, engine_1.operatorWorkflow)("DIVISION-3", "GET_BID_PIPELINE"), division3_controller_1.division3Controller.getBidPipeline);
router.post("/bids", (0, engine_1.operatorWorkflow)("DIVISION-3", "CREATE_BID"), division3_controller_1.division3Controller.createBid);
router.get("/bids", (0, engine_1.operatorWorkflow)("DIVISION-3", "LIST_BIDS"), division3_controller_1.division3Controller.listBids);
router.get("/bids/:id", (0, engine_1.operatorWorkflow)("DIVISION-3", "GET_BID"), division3_controller_1.division3Controller.getBid);
router.post("/bids/:id/line-items", (0, engine_1.operatorWorkflow)("DIVISION-3", "SET_BID_LINE_ITEMS"), division3_controller_1.division3Controller.setLineItems);
router.patch("/bids/:id/pricing", (0, engine_1.operatorWorkflow)("DIVISION-3", "UPDATE_BID_PRICING"), division3_controller_1.division3Controller.updatePricing);
router.post("/bids/:id/quote", (0, engine_1.operatorWorkflow)("DIVISION-3", "GENERATE_BID_QUOTE"), division3_controller_1.division3Controller.generateQuote);
router.post("/bids/:id/submit", (0, engine_1.operatorWorkflow)("DIVISION-3", "SUBMIT_BID"), division3_controller_1.division3Controller.submitBid);
router.patch("/bids/:id/status", (0, engine_1.operatorWorkflow)("DIVISION-3", "UPDATE_BID_STATUS"), division3_controller_1.division3Controller.updateBidStatus);
router.get("/bids/:id/submission", (0, engine_1.operatorWorkflow)("DIVISION-3", "GET_SUBMISSION_DOC"), division3_controller_1.division3Controller.getSubmissionDoc);
exports.default = router;
//# sourceMappingURL=division3.routes.js.map