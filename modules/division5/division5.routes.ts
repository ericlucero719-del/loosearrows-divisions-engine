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

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { division5Controller } from "./division5.controller";

const router = Router();

router.post(
  "/shipments/from-po/:poId",
  operatorWorkflow("DIVISION-5", "CREATE_SHIPMENT_FROM_PO"),
  division5Controller.createShipmentFromPO
);

router.post(
  "/shipments",
  operatorWorkflow("DIVISION-5", "CREATE_SHIPMENT"),
  division5Controller.createShipment
);

router.get(
  "/shipments/overdue",
  operatorWorkflow("DIVISION-5", "LIST_OVERDUE"),
  division5Controller.listOverdue
);

router.get(
  "/shipments/summary",
  operatorWorkflow("DIVISION-5", "FULFILLMENT_SUMMARY"),
  division5Controller.fulfillmentSummary
);

router.get(
  "/shipments",
  operatorWorkflow("DIVISION-5", "LIST_SHIPMENTS"),
  division5Controller.listShipments
);

router.get(
  "/shipments/:shipmentId",
  operatorWorkflow("DIVISION-5", "GET_SHIPMENT"),
  division5Controller.getShipment
);

router.patch(
  "/shipments/:shipmentId/status",
  operatorWorkflow("DIVISION-5", "UPDATE_SHIPMENT_STATUS"),
  division5Controller.updateStatus
);

router.patch(
  "/shipments/:shipmentId/tracking",
  operatorWorkflow("DIVISION-5", "UPDATE_TRACKING"),
  division5Controller.updateTracking
);

router.post(
  "/shipments/:shipmentId/deliver",
  operatorWorkflow("DIVISION-5", "MARK_DELIVERED"),
  division5Controller.markDelivered
);

export default router;
