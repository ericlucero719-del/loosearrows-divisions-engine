// modules/commerce/commerce.controller.ts
// LooseArrows Supply & Logistics™
// Shared controller factory — one set of handlers, all platforms

import { Request, Response } from "express";
import { CommerceService, CommerceOrderPayload } from "./commerce.service";

export function makeCommerceController(svc: CommerceService) {
  return {

    async captureOrder(req: Request, res: Response) {
      try {
        const { order_id, items } = req.body as CommerceOrderPayload;
        if (!order_id || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ error: "order_id and items[] are required" });
        }
        return res.status(201).json(await svc.captureOrder(req.body));
      } catch (e: any) {
        if (e.code === "P2002") return res.status(409).json({ error: `Order ${req.body.order_id} already exists on this platform` });
        return res.status(400).json({ error: e.message });
      }
    },

    async fulfill(req: Request, res: Response) {
      try {
        const { order_id, method, carrier, trackingRef } = req.body;
        if (!order_id || !method) return res.status(400).json({ error: "order_id and method (home|supplier) are required" });
        if (!["home", "supplier"].includes(method)) return res.status(400).json({ error: "method must be 'home' or 'supplier'" });
        return res.json(await svc.fulfill(order_id, method, carrier, trackingRef));
      } catch (e: any) { return res.status(400).json({ error: e.message }); }
    },

    async invoice(req: Request, res: Response) {
      try {
        const { order_id } = req.body;
        if (!order_id) return res.status(400).json({ error: "order_id is required" });
        return res.json(await svc.invoice(order_id));
      } catch (e: any) { return res.status(400).json({ error: e.message }); }
    },

    async payment(req: Request, res: Response) {
      try {
        const { order_id } = req.body;
        if (!order_id) return res.status(400).json({ error: "order_id is required" });
        return res.json(await svc.recordPayment(order_id));
      } catch (e: any) { return res.status(400).json({ error: e.message }); }
    },

    async notify(req: Request, res: Response) {
      try {
        const { order_id, event } = req.body;
        if (!order_id || !event) return res.status(400).json({ error: "order_id and event are required" });
        return res.json(await svc.notify(order_id, event));
      } catch (e: any) { return res.status(400).json({ error: e.message }); }
    },

    async listOrders(req: Request, res: Response) {
      try {
        return res.json(await svc.listOrders(req.query.status as string | undefined));
      } catch (e: any) { return res.status(500).json({ error: e.message }); }
    },

    async getOrder(req: Request, res: Response) {
      try {
        return res.json(await svc.getOrder(req.params.order_id));
      } catch (e: any) { return res.status(404).json({ error: e.message }); }
    },

    async summary(_req: Request, res: Response) {
      try {
        return res.json(await svc.summary());
      } catch (e: any) { return res.status(500).json({ error: e.message }); }
    },
  };
}
