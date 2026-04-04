// modules/division1/division1.controller.ts

import { Request, Response } from "express";
import { division1Service } from "./division1.service";

export const division1Controller = {
  importProducts(req: Request, res: Response) {
    // Accept both a raw array and { products: [...] } wrapper
    const body = req.body;
    const products = Array.isArray(body) ? body : (body?.products ?? null);
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "Body must be an array of products or { products: [...] }" });
    }
    const result = division1Service.importProducts(products);
    return res.json(result);
  },

  listProducts(_req: Request, res: Response) {
    return res.json(division1Service.listProducts());
  },

  getProductBySku(req: Request, res: Response) {
    const product = division1Service.getProductBySku(req.params.sku);
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json(product);
  },
};
