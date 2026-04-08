"use strict";
// modules/division4/division4.routes.ts
// Division 4 — Purchase Orders & Inventory
//
// POST   /division/4/purchase-orders                 Create PO manually
// POST   /division/4/purchase-orders/from-bid/:bidId Auto-create PO from awarded bid
// GET    /division/4/purchase-orders                 List all POs (?status=DRAFT)
// GET    /division/4/purchase-orders/:poId           Get single PO
// PATCH  /division/4/purchase-orders/:poId/status    Update PO status
// GET    /division/4/inventory                       Inventory summary by SKU
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const engine_1 = require("../../src/core/engine");
const division4_controller_1 = require("./division4.controller");
const router = (0, express_1.Router)();
router.post("/purchase-orders/from-bid/:bidId", (0, engine_1.operatorWorkflow)("DIVISION-4", "CREATE_PO_FROM_BID"), division4_controller_1.division4Controller.createPOFromBid);
router.post("/purchase-orders", (0, engine_1.operatorWorkflow)("DIVISION-4", "CREATE_PO"), division4_controller_1.division4Controller.createPO);
router.get("/purchase-orders", (0, engine_1.operatorWorkflow)("DIVISION-4", "LIST_POS"), division4_controller_1.division4Controller.listPOs);
router.get("/purchase-orders/:poId", (0, engine_1.operatorWorkflow)("DIVISION-4", "GET_PO"), division4_controller_1.division4Controller.getPO);
router.patch("/purchase-orders/:poId/status", (0, engine_1.operatorWorkflow)("DIVISION-4", "UPDATE_PO_STATUS"), division4_controller_1.division4Controller.updateStatus);
router.get("/inventory", (0, engine_1.operatorWorkflow)("DIVISION-4", "INVENTORY_SUMMARY"), division4_controller_1.division4Controller.inventorySummary);
exports.default = router;
//# sourceMappingURL=division4.routes.js.map