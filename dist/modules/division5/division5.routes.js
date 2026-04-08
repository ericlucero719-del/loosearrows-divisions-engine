"use strict";
// modules/division5/division5.routes.ts
// Division 5 — Shipments & Fulfillment
//
// POST   /division/5/shipments                        Create shipment
// POST   /division/5/shipments/from-po/:poId          Auto-create shipment from PO
// GET    /division/5/shipments                        List all (?status=IN_TRANSIT)
// GET    /division/5/shipments/overdue                List overdue shipments
// GET    /division/5/shipments/summary                Fulfillment summary counts
// GET    /division/5/shipments/:shipmentId            Get single
// PATCH  /division/5/shipments/:shipmentId/status     Update status
// PATCH  /division/5/shipments/:shipmentId/tracking   Update carrier/tracking
// POST   /division/5/shipments/:shipmentId/deliver    Mark delivered
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const engine_1 = require("../../src/core/engine");
const division5_controller_1 = require("./division5.controller");
const router = (0, express_1.Router)();
router.post("/shipments/from-po/:poId", (0, engine_1.operatorWorkflow)("DIVISION-5", "CREATE_SHIPMENT_FROM_PO"), division5_controller_1.division5Controller.createShipmentFromPO);
router.post("/shipments", (0, engine_1.operatorWorkflow)("DIVISION-5", "CREATE_SHIPMENT"), division5_controller_1.division5Controller.createShipment);
router.get("/shipments/overdue", (0, engine_1.operatorWorkflow)("DIVISION-5", "LIST_OVERDUE"), division5_controller_1.division5Controller.listOverdue);
router.get("/shipments/summary", (0, engine_1.operatorWorkflow)("DIVISION-5", "FULFILLMENT_SUMMARY"), division5_controller_1.division5Controller.fulfillmentSummary);
router.get("/shipments", (0, engine_1.operatorWorkflow)("DIVISION-5", "LIST_SHIPMENTS"), division5_controller_1.division5Controller.listShipments);
router.get("/shipments/:shipmentId", (0, engine_1.operatorWorkflow)("DIVISION-5", "GET_SHIPMENT"), division5_controller_1.division5Controller.getShipment);
router.patch("/shipments/:shipmentId/status", (0, engine_1.operatorWorkflow)("DIVISION-5", "UPDATE_SHIPMENT_STATUS"), division5_controller_1.division5Controller.updateStatus);
router.patch("/shipments/:shipmentId/tracking", (0, engine_1.operatorWorkflow)("DIVISION-5", "UPDATE_TRACKING"), division5_controller_1.division5Controller.updateTracking);
router.post("/shipments/:shipmentId/deliver", (0, engine_1.operatorWorkflow)("DIVISION-5", "MARK_DELIVERED"), division5_controller_1.division5Controller.markDelivered);
exports.default = router;
//# sourceMappingURL=division5.routes.js.map