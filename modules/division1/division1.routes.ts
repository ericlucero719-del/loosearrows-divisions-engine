// modules/division1/division1.routes.ts
// Division 1 — Product Intake & Pricing
//
// Example requests:
//   POST /division/1/products/import
//     Body: [{ "productName": "Black Toner", "sku": "CF360A", "price": 145.00, "cost": 95.00, "status": "active" }]
//     Response: { "imported": 1, "skipped": 0 }
//
//   GET /division/1/products
//     Response: [ { "productName": "Black Toner", "sku": "CF360A", ... } ]
//
//   GET /division/1/products/CF360A
//     Response: { "productName": "Black Toner", "sku": "CF360A", ... }

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { division1Controller } from "./division1.controller";

const router = Router();

router.post(
  "/products/import",
  operatorWorkflow("DIVISION-1", "IMPORT_PRODUCTS"),
  division1Controller.importProducts
);

router.get(
  "/products",
  operatorWorkflow("DIVISION-1", "LIST_PRODUCTS"),
  division1Controller.listProducts
);

router.get(
  "/products/:sku",
  operatorWorkflow("DIVISION-1", "GET_PRODUCT"),
  division1Controller.getProductBySku
);

export default router;
