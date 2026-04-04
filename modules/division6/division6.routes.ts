// modules/division6/division6.routes.ts
// Division 6 — Compliance & Documentation
//
// Example requests:
//   POST /division/6/requirements
//     Body: { "entityType": "contract", "entityId": "contract-uuid", "documentType": "SAM_REGISTRATION" }
//     Response: { "id": "...", "status": "Pending", ... }
//
//   POST /division/6/requirements/:id/attach
//     Body: { "name": "SAM_Certificate.pdf", "url": "https://..." }
//     Response: updated compliance requirement with attached document
//
//   GET /division/6/requirements?entityId=...&entityType=contract
//     Response: filtered compliance requirements

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { division6Controller } from "./division6.controller";

const router = Router();

router.post(
  "/requirements",
  operatorWorkflow("DIVISION-6", "CREATE_COMPLIANCE_REQUIREMENT"),
  division6Controller.createRequirement
);

// Alias: POST /compliance → same as /requirements
router.post(
  "/compliance",
  operatorWorkflow("DIVISION-6", "CREATE_COMPLIANCE_REQUIREMENT"),
  division6Controller.createRequirement
);

// Attach a document by entity (looks up requirement automatically)
router.post(
  "/documents",
  operatorWorkflow("DIVISION-6", "ATTACH_DOCUMENT_BY_ENTITY"),
  division6Controller.attachDocumentByEntity
);

router.post(
  "/requirements/:id/attach",
  operatorWorkflow("DIVISION-6", "ATTACH_DOCUMENT"),
  division6Controller.attachDocument
);

router.get(
  "/requirements",
  operatorWorkflow("DIVISION-6", "LIST_REQUIREMENTS"),
  division6Controller.listRequirements
);

router.get(
  "/requirements/:id",
  operatorWorkflow("DIVISION-6", "GET_REQUIREMENT"),
  division6Controller.getRequirement
);

export default router;
