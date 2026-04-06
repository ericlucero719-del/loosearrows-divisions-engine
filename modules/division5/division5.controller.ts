// modules/division5/division5.controller.ts
// Division 5 — Shipments & Fulfillment

import { Request, Response } from "express";
import { division5Service } from "./division5.service";

export const division5Controller = {

  async listShipments(req: Request, res: Response) {
    try {
      const { status } = req.query as Record<string, string | undefined>;
      return res.json(await division5Service.listShipments(status));
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },

  async getShipment(req: Request, res: Response) {
    try {
      const s = await division5Service.getShipment(req.params.shipmentId);
      if (!s) return res.status(404).json({ error: "Shipment not found" });
      return res.json(s);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },

  async createShipment(req: Request, res: Response) {
    try {
      const s = await division5Service.createShipment(req.body);
      return res.status(201).json(s);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },

  async createShipmentFromPO(req: Request, res: Response) {
    try {
      const s = await division5Service.createShipmentFromPO(req.params.poId);
      return res.status(201).json(s);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { status, notes } = req.body;
      if (!status) return res.status(400).json({ error: "status is required" });
      const s = await division5Service.updateStatus(req.params.shipmentId, status.toUpperCase().replace(/ /g, "_"), notes);
      return res.json(s);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  async updateTracking(req: Request, res: Response) {
    try {
      const s = await division5Service.updateTracking(req.params.shipmentId, req.body);
      return res.json(s);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  async markDelivered(req: Request, res: Response) {
    try {
      const s = await division5Service.markDelivered(req.params.shipmentId);
      return res.json(s);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  async listOverdue(_req: Request, res: Response) {
    try {
      return res.json(await division5Service.listOverdue());
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },

  async fulfillmentSummary(_req: Request, res: Response) {
    try {
      return res.json(await division5Service.fulfillmentSummary());
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },
};
