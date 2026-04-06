// modules/division3/division3.controller.ts

import { Request, Response } from "express";
import { division3Service } from "./division3.service";

export const division3Controller = {
  // ── Work Requests ────────────────────────────────────────────────────────────
  createRequest(req: Request, res: Response) {
    const { type, requestorId, notes } = req.body;
    if (!type || !requestorId) {
      return res.status(400).json({ error: "type and requestorId are required" });
    }
    return res.status(201).json(division3Service.createRequest({ type, requestorId, notes }));
  },

  attachProducts(req: Request, res: Response) {
    const { productIds } = req.body;
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ error: "productIds must be an array" });
    }
    const result = division3Service.attachProducts(req.params.id, productIds);
    if (!result) return res.status(404).json({ error: "Request not found" });
    return res.json(result);
  },

  linkContract(req: Request, res: Response) {
    const { contractId } = req.body;
    if (!contractId) return res.status(400).json({ error: "contractId is required" });
    const result = division3Service.linkContract(req.params.id, contractId);
    if (!result) return res.status(404).json({ error: "Request not found" });
    return res.json(result);
  },

  updateStatus(req: Request, res: Response) {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "status is required" });
    const result = division3Service.updateStatus(req.params.id, status);
    if (!result) return res.status(404).json({ error: "Request not found" });
    return res.json(result);
  },

  listRequests(_req: Request, res: Response) {
    return res.json(division3Service.listRequests());
  },

  getRequest(req: Request, res: Response) {
    const result = division3Service.getRequest(req.params.id);
    if (!result) return res.status(404).json({ error: "Request not found" });
    return res.json(result);
  },

  // ── Bid Pipeline ─────────────────────────────────────────────────────────────

  // GET /division/3/bid-pipeline — active contracts open for bidding
  getBidPipeline(_req: Request, res: Response) {
    return res.json(division3Service.getBidPipeline());
  },

  // POST /division/3/bids
  createBid(req: Request, res: Response) {
    const { contractId, vendorId, vendorName, requestId, lineItems, notes, bidRef } = req.body;
    if (!contractId || !vendorId) {
      return res.status(400).json({ error: "contractId and vendorId are required" });
    }
    const result = division3Service.createBid({ contractId, vendorId, vendorName, requestId, lineItems, notes, bidRef });
    if ("error" in result) return res.status(400).json(result);
    return res.status(201).json(result);
  },

  // GET /division/3/bids  (optional ?status=DRAFT)
  listBids(req: Request, res: Response) {
    const { status } = req.query as { status?: string };
    return res.json(division3Service.listBids(status as any));
  },

  // GET /division/3/bids/:id
  getBid(req: Request, res: Response) {
    const result = division3Service.getBid(req.params.id);
    if (!result) return res.status(404).json({ error: "Bid not found" });
    return res.json(result);
  },

  // POST /division/3/bids/:id/line-items  — replace all line items on a DRAFT bid
  setLineItems(req: Request, res: Response) {
    const { lineItems } = req.body;
    if (!Array.isArray(lineItems)) {
      return res.status(400).json({ error: "lineItems must be an array of { sku, quantity, unitPrice, clin?, description? }" });
    }
    const result = division3Service.setLineItems(req.params.id, lineItems);
    if ("error" in result) return res.status(400).json(result);
    return res.json(result);
  },

  // POST /division/3/bids/:id/quote  — generate a Division 9 quote from the bid
  generateQuote(req: Request, res: Response) {
    const result = division3Service.generateQuote(req.params.id);
    if ("error" in result) return res.status(400).json(result);
    return res.json(result);
  },

  // POST /division/3/bids/:id/submit  — DRAFT → SUBMITTED, quote → Sent
  submitBid(req: Request, res: Response) {
    const result = division3Service.submitBid(req.params.id);
    if ("error" in result) return res.status(400).json(result);
    return res.json(result);
  },

  // PATCH /division/3/bids/:id/status  — UNDER_REVIEW | AWARDED | LOST | WITHDRAWN
  updateBidStatus(req: Request, res: Response) {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "status is required" });
    const result = division3Service.updateBidStatus(req.params.id, status);
    if ("error" in result) return res.status(400).json(result);
    return res.json(result);
  },
};
