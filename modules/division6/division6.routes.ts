// modules/division6/division6.routes.ts
// Division 6 — Compliance & Documentation
//
// GET    /division/6/doc-types                              list valid document types
// GET    /division/6/documents                             list all (filter: ?docType=&status=)
// POST   /division/6/documents                            register a compliance document
// GET    /division/6/documents/:docId                     get document
// PATCH  /division/6/documents/:docId                     update document
// DELETE /division/6/documents/:docId                     delete document
// GET    /division/6/compliance-status                    overall compliance posture
// POST   /division/6/capability-statement                 generate capability statement

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { division6Controller } from "./division6.controller";

const router = Router();

router.get("/doc-types", operatorWorkflow("DIVISION-6", "LIST_DOC_TYPES"), division6Controller.docTypes);

router.get("/compliance-status", operatorWorkflow("DIVISION-6", "COMPLIANCE_STATUS"), division6Controller.complianceStatus);

router.post("/capability-statement", operatorWorkflow("DIVISION-6", "GENERATE_CAP_STATEMENT"), division6Controller.generateCapabilityStatement);

router.get("/documents", operatorWorkflow("DIVISION-6", "LIST_DOCS"), division6Controller.listDocs);
router.post("/documents", operatorWorkflow("DIVISION-6", "CREATE_DOC"), division6Controller.createDoc);

router.get("/documents/:docId", operatorWorkflow("DIVISION-6", "GET_DOC"), division6Controller.getDoc);
router.patch("/documents/:docId", operatorWorkflow("DIVISION-6", "UPDATE_DOC"), division6Controller.updateDoc);
router.delete("/documents/:docId", operatorWorkflow("DIVISION-6", "DELETE_DOC"), division6Controller.deleteDoc);

export default router;
