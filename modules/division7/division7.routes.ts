// modules/division7/division7.routes.ts
// Division 7 — Vendor & Partner Management
//
// Example requests:
//   POST /division/7/vendors
//     Body: { "name": "Acme Supplies", "categories": ["toner", "paper"], "capabilities": ["drop-ship"], "contactEmail": "orders@acme.com" }
//     Response: { "id": "...", "name": "Acme Supplies", ... }
//
//   PUT /division/7/vendors/:id
//     Body: { "status": "active" }
//
//   POST /division/7/vendors/:id/attach
//     Body: { "type": "contract", "referenceId": "contract-uuid" }

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { division7Controller } from "./division7.controller";

const router = Router();

router.post(
  "/vendors",
  operatorWorkflow("DIVISION-7", "CREATE_VENDOR"),
  division7Controller.createVendor
);

router.get(
  "/vendors",
  operatorWorkflow("DIVISION-7", "LIST_VENDORS"),
  division7Controller.listVendors
);

router.get(
  "/vendors/:id",
  operatorWorkflow("DIVISION-7", "GET_VENDOR"),
  division7Controller.getVendor
);

router.put(
  "/vendors/:id",
  operatorWorkflow("DIVISION-7", "UPDATE_VENDOR"),
  division7Controller.updateVendor
);

router.post(
  "/vendors/:id/attach",
  operatorWorkflow("DIVISION-7", "ATTACH_VENDOR"),
  division7Controller.attachVendor
);

export default router;
