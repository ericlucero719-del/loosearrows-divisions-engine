// modules/division1/division1.routes.ts
// Division 1 — Product Catalog & Pricing
//
// GET    /division/1/products                    list all (filter: ?category=&status=)
// POST   /division/1/products                    create product
// POST   /division/1/products/import             bulk import
// GET    /division/1/products/:sku               get product
// PATCH  /division/1/products/:sku               update product
// DELETE /division/1/products/:sku               delete product
// GET    /division/1/products/:sku/price         price at all three margin bands
// GET    /division/1/catalog/summary             catalog summary stats

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { division1Controller } from "./division1.controller";

const router = Router();

router.get("/catalog/summary", operatorWorkflow("DIVISION-1", "CATALOG_SUMMARY"), division1Controller.catalogSummary);

router.post("/products/import", operatorWorkflow("DIVISION-1", "BULK_IMPORT"), division1Controller.bulkImport);

router.get("/products", operatorWorkflow("DIVISION-1", "LIST_PRODUCTS"), division1Controller.listProducts);
router.post("/products", operatorWorkflow("DIVISION-1", "CREATE_PRODUCT"), division1Controller.createProduct);

router.get("/products/:sku/price", operatorWorkflow("DIVISION-1", "PRICE_CALC"), division1Controller.priceCalc);
router.get("/products/:sku", operatorWorkflow("DIVISION-1", "GET_PRODUCT"), division1Controller.getProduct);
router.patch("/products/:sku", operatorWorkflow("DIVISION-1", "UPDATE_PRODUCT"), division1Controller.updateProduct);
router.delete("/products/:sku", operatorWorkflow("DIVISION-1", "DELETE_PRODUCT"), division1Controller.deleteProduct);

export default router;
