// modules/division5/division5.controller.ts

import { Request, Response } from "express";
import { division5Service } from "./division5.service";

export const division5Controller = {
  createShipment(req: Request, res: Response) {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items array is required" });
    }
    const shipment = division5Service.createShipment(req.body);
    return res.status(201).json(shipment);
  },

  updateStatus(req: Request, res: Response) {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "status is required" });
    const result = division5Service.updateStatus(req.params.id, status);
    if (!result) return res.status(404).json({ error: "Shipment not found" });
    return res.json(result);
  },

  listShipments(req: Request, res: Response) {
    const { contractId, requestId } = req.query as Record<string, string | undefined>;
    return res.json(division5Service.listShipments({ contractId, requestId }));
  },

  getShipment(req: Request, res: Response) {
    const result = division5Service.getShipment(req.params.id);
    if (!result) return res.status(404).json({ error: "Shipment not found" });
    return res.json(result);
  },
};
