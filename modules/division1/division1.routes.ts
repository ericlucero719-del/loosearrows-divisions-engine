// modules/division1/division1.routes.ts
// Division 1 — Product Intake & Pricing
//
// Product routes:
//   POST   /division/1/products/import              import array of products
//   POST   /division/1/products                     create a single product
//   GET    /division/1/products                     list all products
//   GET    /division/1/products?category=IT_ELECTRONICS  filter by category
//   GET    /division/1/products/:sku                get one product
//   PATCH  /division/1/products/:sku                update a product
//
// Category routes:
//   GET    /division/1/categories                   list all 10 categories with product counts
//   GET    /division/1/categories/:cat              category metadata + products
//     :cat examples: OFFICE_SUPPLIES, IT_ELECTRONICS, SAFETY_PPE, JANITORIAL_FACILITIES,
//                    MEDICAL_HEALTH, TOOLS_HARDWARE, FURNITURE_FIXTURES, UNIFORMS_APPAREL,
//                    FOOD_CATERING, VEHICLES_EQUIPMENT

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { division1Controller } from "./division1.controller";

const router = Router();

// ── Products ──────────────────────────────────────────────────────────────────
router.post(
  "/products/import",
  operatorWorkflow("DIVISION-1", "IMPORT_PRODUCTS"),
  division1Controller.importProducts
);

router.post(
  "/products",
  operatorWorkflow("DIVISION-1", "CREATE_PRODUCT"),
  division1Controller.createProduct
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

router.patch(
  "/products/:sku",
  operatorWorkflow("DIVISION-1", "UPDATE_PRODUCT"),
  division1Controller.updateProduct
);

// ── Categories ────────────────────────────────────────────────────────────────
router.get(
  "/categories",
  operatorWorkflow("DIVISION-1", "LIST_CATEGORIES"),
  division1Controller.listCategories
);

router.get(
  "/categories/:cat",
  operatorWorkflow("DIVISION-1", "GET_CATEGORY_PRODUCTS"),
  division1Controller.getCategoryProducts
);

export default router;
