"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const engine_1 = require("../../src/core/engine");
const division6_controller_1 = require("./division6.controller");
const router = (0, express_1.Router)();
router.get("/doc-types", (0, engine_1.operatorWorkflow)("DIVISION-6", "LIST_DOC_TYPES"), division6_controller_1.division6Controller.docTypes);
router.get("/compliance-status", (0, engine_1.operatorWorkflow)("DIVISION-6", "COMPLIANCE_STATUS"), division6_controller_1.division6Controller.complianceStatus);
router.post("/capability-statement", (0, engine_1.operatorWorkflow)("DIVISION-6", "GENERATE_CAP_STATEMENT"), division6_controller_1.division6Controller.generateCapabilityStatement);
router.get("/documents", (0, engine_1.operatorWorkflow)("DIVISION-6", "LIST_DOCS"), division6_controller_1.division6Controller.listDocs);
router.post("/documents", (0, engine_1.operatorWorkflow)("DIVISION-6", "CREATE_DOC"), division6_controller_1.division6Controller.createDoc);
router.get("/documents/:docId", (0, engine_1.operatorWorkflow)("DIVISION-6", "GET_DOC"), division6_controller_1.division6Controller.getDoc);
router.patch("/documents/:docId", (0, engine_1.operatorWorkflow)("DIVISION-6", "UPDATE_DOC"), division6_controller_1.division6Controller.updateDoc);
router.delete("/documents/:docId", (0, engine_1.operatorWorkflow)("DIVISION-6", "DELETE_DOC"), division6_controller_1.division6Controller.deleteDoc);
exports.default = router;
//# sourceMappingURL=division6.routes.js.map