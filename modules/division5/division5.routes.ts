// modules/division5/division5.routes.ts
// Division 5 — Logistics & Fulfillment
//
// Example requests:
//   POST /division/5/shipments
//     Body: { "contractId": "...", "items": [{ "sku": "CF360A", "quantity": 10 }], "carrier": "FedEx" }
//     Response: { "id": "...", "status": "Pending", ... }
//
//   PUT /division/5/shipments/:id/status
//     Body: { "status": "In Transit" }
//
//   GET /division/5/shipments?contractId=...
//     Response: [ shipments matching filter ]

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { division5Controller } from "./division5.controller";

const router = Router();

router.post(
  "/shipments",
  operatorWorkflow("DIVISION-5", "CREATE_SHIPMENT"),
  division5Controller.createShipment
);

router.put(
  "/shipments/:id/status",
  operatorWorkflow("DIVISION-5", "UPDATE_SHIPMENT_STATUS"),
  division5Controller.updateStatus
);

router.get(
  "/shipments",
  operatorWorkflow("DIVISION-5", "LIST_SHIPMENTS"),
  division5Controller.listShipments
);

router.get(
  "/shipments/:id",
  operatorWorkflow("DIVISION-5", "GET_SHIPMENT"),
  division5Controller.getShipment
);

export default router;
