"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const engine_1 = require("../../src/core/engine");
const division1_controller_1 = require("./division1.controller");
const router = (0, express_1.Router)();
router.get("/catalog/summary", (0, engine_1.operatorWorkflow)("DIVISION-1", "CATALOG_SUMMARY"), division1_controller_1.division1Controller.catalogSummary);
router.post("/products/import", (0, engine_1.operatorWorkflow)("DIVISION-1", "BULK_IMPORT"), division1_controller_1.division1Controller.bulkImport);
router.get("/products", (0, engine_1.operatorWorkflow)("DIVISION-1", "LIST_PRODUCTS"), division1_controller_1.division1Controller.listProducts);
router.post("/products", (0, engine_1.operatorWorkflow)("DIVISION-1", "CREATE_PRODUCT"), division1_controller_1.division1Controller.createProduct);
router.get("/products/:sku/price", (0, engine_1.operatorWorkflow)("DIVISION-1", "PRICE_CALC"), division1_controller_1.division1Controller.priceCalc);
router.get("/products/:sku", (0, engine_1.operatorWorkflow)("DIVISION-1", "GET_PRODUCT"), division1_controller_1.division1Controller.getProduct);
router.patch("/products/:sku", (0, engine_1.operatorWorkflow)("DIVISION-1", "UPDATE_PRODUCT"), division1_controller_1.division1Controller.updateProduct);
router.delete("/products/:sku", (0, engine_1.operatorWorkflow)("DIVISION-1", "DELETE_PRODUCT"), division1_controller_1.division1Controller.deleteProduct);
exports.default = router;
//# sourceMappingURL=division1.routes.js.map