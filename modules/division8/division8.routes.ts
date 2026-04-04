// modules/division8/division8.routes.ts
// Division 8 — Agency / Customer Management
//
// Example requests:
//   POST /division/8/agencies
//     Body: { "name": "US Embassy Manila", "contacts": [{ "name": "Michael Warren", "email": "manilapurchasing@state.gov" }] }
//     Response: { "id": "...", "name": "US Embassy Manila", ... }
//
//   POST /division/8/agencies/:id/link-contract
//     Body: { "contractId": "..." }
//
//   POST /division/8/agencies/:id/link-request
//     Body: { "requestId": "..." }

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { division8Controller } from "./division8.controller";

const router = Router();

router.post(
  "/agencies",
  operatorWorkflow("DIVISION-8", "CREATE_AGENCY"),
  division8Controller.createAgency
);

router.get(
  "/agencies",
  operatorWorkflow("DIVISION-8", "LIST_AGENCIES"),
  division8Controller.listAgencies
);

router.get(
  "/agencies/:id",
  operatorWorkflow("DIVISION-8", "GET_AGENCY"),
  division8Controller.getAgency
);

router.put(
  "/agencies/:id",
  operatorWorkflow("DIVISION-8", "UPDATE_AGENCY"),
  division8Controller.updateAgency
);

router.post(
  "/agencies/:id/link-contract",
  operatorWorkflow("DIVISION-8", "LINK_CONTRACT_TO_AGENCY"),
  division8Controller.linkContract
);

// Aliases: shorter paths
router.post(
  "/agencies/:id/contracts",
  operatorWorkflow("DIVISION-8", "LINK_CONTRACT_TO_AGENCY"),
  division8Controller.linkContract
);

router.post(
  "/agencies/:id/link-request",
  operatorWorkflow("DIVISION-8", "LINK_REQUEST_TO_AGENCY"),
  division8Controller.linkRequest
);

router.post(
  "/agencies/:id/requests",
  operatorWorkflow("DIVISION-8", "LINK_REQUEST_TO_AGENCY"),
  division8Controller.linkRequest
);

export default router;
