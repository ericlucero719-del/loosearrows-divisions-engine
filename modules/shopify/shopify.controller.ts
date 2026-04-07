// modules/shopify/shopify.controller.ts
import { Request, Response } from "express";
import { shopifyService } from "./shopify.service";
import * as crypto from "crypto";

const SHARED_SECRET = process.env.SHOPIFY_APP_SHARED_SECRET ?? "";

function verifyWebhook(rawBody: Buffer, hmacHeader: string): boolean {
  if (!SHARED_SECRET) return false;
  const digest = crypto.createHmac("sha256", SHARED_SECRET).update(rawBody).digest("base64");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
}

export const shopifyController = {

  async storeInfo(_req: Request, res: Response) {
    try { return res.json(await shopifyService.storeInfo()); }
    catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async syncOrders(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      return res.json(await shopifyService.syncOrders(limit));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async syncOne(req: Request, res: Response) {
    try {
      return res.json(await shopifyService.syncOne(req.params.shopify_id));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  // Public webhook — verified via HMAC, no API key
  async webhook(req: Request, res: Response) {
    try {
      const hmac  = req.headers["x-shopify-hmac-sha256"] as string ?? "";
      const topic = req.headers["x-shopify-topic"] as string ?? "";
      const raw   = (req as any).rawBody as Buffer | undefined;

      if (raw && hmac && !verifyWebhook(raw, hmac)) {
        return res.status(401).json({ error: "Invalid webhook signature" });
      }

      const result = await shopifyService.processWebhook(topic, req.body);
      return res.status(200).json(result);
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async listOrders(req: Request, res: Response) {
    try { return res.json(await shopifyService.listOrders(req.query.status as string)); }
    catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async getOrder(req: Request, res: Response) {
    try { return res.json(await shopifyService.getOrder(req.params.order_id)); }
    catch (e: any) { return res.status(404).json({ error: e.message }); }
  },

  async summary(_req: Request, res: Response) {
    try { return res.json(await shopifyService.summary()); }
    catch (e: any) { return res.status(500).json({ error: e.message }); }
  },
};
