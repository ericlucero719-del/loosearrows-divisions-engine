// modules/division4/division4.routes.ts
// Division 4 — Purchase Orders & Inventory
//
// POST   /division/4/purchase-orders                 Create PO manually
// POST   /division/4/purchase-orders/from-bid/:bidId Auto-create PO from awarded bid
// GET    /division/4/purchase-orders                 List all POs (?status=DRAFT)
// GET    /division/4/purchase-orders/:poId           Get single PO
// PATCH  /division/4/purchase-orders/:poId/status    Update PO status
// GET    /division/4/inventory                       Inventory summary by SKU

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { division4Controller } from "./division4.controller";

const router = Router();

router.post(
  "/purchase-orders/from-bid/:bidId",
  operatorWorkflow("DIVISION-4", "CREATE_PO_FROM_BID"),
  division4Controller.createPOFromBid
);

router.post(
  "/purchase-orders",
  operatorWorkflow("DIVISION-4", "CREATE_PO"),
  division4Controller.createPO
);

router.get(
  "/purchase-orders",
  operatorWorkflow("DIVISION-4", "LIST_POS"),
  division4Controller.listPOs
);

router.get(
  "/purchase-orders/:poId",
  operatorWorkflow("DIVISION-4", "GET_PO"),
  division4Controller.getPO
);

router.patch(
  "/purchase-orders/:poId/status",
  operatorWorkflow("DIVISION-4", "UPDATE_PO_STATUS"),
  division4Controller.updateStatus
);

router.get(
  "/inventory",
  operatorWorkflow("DIVISION-4", "INVENTORY_SUMMARY"),
  division4Controller.inventorySummary
);

export default router;
