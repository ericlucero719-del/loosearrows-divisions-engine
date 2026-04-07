// modules/division1/division1.controller.ts
// Division 1 — Product Catalog & Pricing

import { Request, Response } from "express";
import { division1Service } from "./division1.service";

export const division1Controller = {

  async listProducts(req: Request, res: Response) {
    try {
      const { category, status } = req.query as Record<string, string | undefined>;
      return res.json(await division1Service.listProducts(category, status));
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async getProduct(req: Request, res: Response) {
    try {
      const p = await division1Service.getProduct(req.params.sku);
      if (!p) return res.status(404).json({ error: "Product not found" });
      return res.json(p);
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async createProduct(req: Request, res: Response) {
    try {
      const { sku, name, cost } = req.body;
      if (!sku || !name || cost == null) return res.status(400).json({ error: "sku, name, and cost are required" });
      return res.status(201).json(await division1Service.createProduct(req.body));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async updateProduct(req: Request, res: Response) {
    try {
      const p = await division1Service.updateProduct(req.params.sku, req.body);
      return res.json(p);
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async deleteProduct(req: Request, res: Response) {
    try {
      await division1Service.deleteProduct(req.params.sku);
      return res.json({ deleted: req.params.sku });
    } catch (e: any) { return res.status(404).json({ error: e.message }); }
  },

  async priceCalc(req: Request, res: Response) {
    try {
      return res.json(await division1Service.priceCalc(req.params.sku));
    } catch (e: any) { return res.status(404).json({ error: e.message }); }
  },

  async bulkImport(req: Request, res: Response) {
    try {
      const products = Array.isArray(req.body) ? req.body : req.body?.products;
      if (!Array.isArray(products)) return res.status(400).json({ error: "Body must be an array or { products: [...] }" });
      return res.json(await division1Service.bulkImport(products));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async catalogSummary(_req: Request, res: Response) {
    try {
      return res.json(await division1Service.catalogSummary());
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  },
};
