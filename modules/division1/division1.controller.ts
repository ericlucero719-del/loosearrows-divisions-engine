// modules/division1/division1.controller.ts

import { Request, Response } from "express";
import { division1Service } from "./division1.service";

export const division1Controller = {
  importProducts(req: Request, res: Response) {
    const body = req.body;
    const products = Array.isArray(body) ? body : (body?.products ?? null);
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "Body must be an array of products or { products: [...] }" });
    }
    const result = division1Service.importProducts(products);
    return res.json(result);
  },

  listProducts(req: Request, res: Response) {
    const { category } = req.query as { category?: string };
    return res.json(division1Service.listProducts(category));
  },

  getProductBySku(req: Request, res: Response) {
    const product = division1Service.getProductBySku(req.params.sku);
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json(product);
  },

  createProduct(req: Request, res: Response) {
    const { sku, productName, price, cost } = req.body;
    if (!sku || !productName || price == null || cost == null) {
      return res.status(400).json({ error: "sku, productName, price, and cost are required" });
    }
    return res.status(201).json(division1Service.createProduct(req.body));
  },

  updateProduct(req: Request, res: Response) {
    const updated = division1Service.updateProduct(req.params.sku, req.body);
    if (!updated) return res.status(404).json({ error: "Product not found" });
    return res.json(updated);
  },

  listCategories(_req: Request, res: Response) {
    return res.json(division1Service.listCategories());
  },

  getCategoryProducts(req: Request, res: Response) {
    const meta = division1Service.getCategory(req.params.cat);
    if (!meta) {
      return res.status(404).json({ error: "Category not found", validCategories: [
        "OFFICE_SUPPLIES","IT_ELECTRONICS","SAFETY_PPE","JANITORIAL_FACILITIES",
        "MEDICAL_HEALTH","TOOLS_HARDWARE","FURNITURE_FIXTURES","UNIFORMS_APPAREL",
        "FOOD_CATERING","VEHICLES_EQUIPMENT",
      ]});
    }
    const products = division1Service.listProducts(req.params.cat);
    return res.json({ category: meta, products });
  },
};
