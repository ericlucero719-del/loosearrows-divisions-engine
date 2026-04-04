// modules/division4/division4.routes.ts
// Division 4 — Inventory & Assets
//
// Example requests:
//   PUT /division/4/inventory/CF360A
//     Body: { "onHand": 200, "allocated": 0, "warehouseLocation": "RACK-A1", "reorderPoint": 20 }
//     Response: { "sku": "CF360A", "onHand": 200, "allocated": 0, "available": 200, ... }
//
//   POST /division/4/inventory/CF360A/allocate
//     Body: { "quantity": 10, "referenceId": "contract-uuid", "referenceType": "contract" }
//     Response: { "sku": "CF360A", "onHand": 200, "allocated": 10, "available": 190, ... }
//
//   POST /division/4/inventory/CF360A/release
//     Body: { "quantity": 5 }
//
//   GET /division/4/inventory
//     Response: all inventory items

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { division4Controller } from "./division4.controller";

const router = Router();

router.get(
  "/inventory",
  operatorWorkflow("DIVISION-4", "LIST_INVENTORY"),
  division4Controller.listInventory
);

router.get(
  "/inventory/:sku",
  operatorWorkflow("DIVISION-4", "GET_INVENTORY"),
  division4Controller.getInventory
);

router.put(
  "/inventory/:sku",
  operatorWorkflow("DIVISION-4", "UPDATE_INVENTORY"),
  division4Controller.upsertInventory
);

router.post(
  "/inventory/:sku/allocate",
  operatorWorkflow("DIVISION-4", "ALLOCATE_INVENTORY"),
  division4Controller.allocate
);

router.post(
  "/inventory/:sku/release",
  operatorWorkflow("DIVISION-4", "RELEASE_INVENTORY"),
  division4Controller.release
);

export default router;
