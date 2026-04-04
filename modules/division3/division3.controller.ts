// modules/division3/division3.controller.ts

import { Request, Response } from "express";
import { division3Service } from "./division3.service";

export const division3Controller = {
  createRequest(req: Request, res: Response) {
    const { type, requestorId, notes } = req.body;
    if (!type || !requestorId) {
      return res.status(400).json({ error: "type and requestorId are required" });
    }
    const request = division3Service.createRequest({ type, requestorId, notes });
    return res.status(201).json(request);
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
};
