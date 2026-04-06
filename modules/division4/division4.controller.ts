// modules/division4/division4.controller.ts
// Division 4 — Purchase Orders & Inventory

import { Request, Response } from "express";
import { division4Service } from "./division4.service";

export const division4Controller = {

  async listPOs(req: Request, res: Response) {
    try {
      const { status } = req.query as Record<string, string | undefined>;
      const pos = await division4Service.listPOs(status);
      return res.json(pos);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },

  async getPO(req: Request, res: Response) {
    try {
      const po = await division4Service.getPO(req.params.poId);
      if (!po) return res.status(404).json({ error: "Purchase order not found" });
      return res.json(po);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },

  async createPO(req: Request, res: Response) {
    try {
      const po = await division4Service.createPO(req.body);
      return res.status(201).json(po);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },

  async createPOFromBid(req: Request, res: Response) {
    try {
      const po = await division4Service.createPOFromBid(req.params.bidId);
      return res.status(201).json(po);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { status, notes } = req.body;
      if (!status) return res.status(400).json({ error: "status is required" });
      const po = await division4Service.updateStatus(req.params.poId, status, notes);
      return res.json(po);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  async inventorySummary(_req: Request, res: Response) {
    try {
      const summary = await division4Service.inventorySummary();
      return res.json(summary);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },
};
