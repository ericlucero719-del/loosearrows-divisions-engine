// modules/division4/division4.controller.ts

import { Request, Response } from "express";
import { division4Service } from "./division4.service";

export const division4Controller = {
  getInventory(req: Request, res: Response) {
    const item = division4Service.getInventory(req.params.sku);
    if (!item) return res.status(404).json({ error: "SKU not found in inventory" });
    return res.json(item);
  },

  upsertInventory(req: Request, res: Response) {
    const { sku } = req.params;
    const item = division4Service.upsertInventory({ ...req.body, sku });
    return res.json(item);
  },

  allocate(req: Request, res: Response) {
    const { quantity, referenceId, referenceType } = req.body;
    if (!quantity || !referenceId || !referenceType) {
      return res.status(400).json({ error: "quantity, referenceId, and referenceType are required" });
    }
    const result = division4Service.allocate({
      sku: req.params.sku,
      quantity,
      referenceId,
      referenceType,
    });
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result.item);
  },

  release(req: Request, res: Response) {
    const { quantity } = req.body;
    if (!quantity) return res.status(400).json({ error: "quantity is required" });
    const result = division4Service.release(req.params.sku, quantity);
    if (!result.success) return res.status(400).json({ error: result.error });
    return res.json(result.item);
  },

  listInventory(_req: Request, res: Response) {
    return res.json(division4Service.listInventory());
  },
};
