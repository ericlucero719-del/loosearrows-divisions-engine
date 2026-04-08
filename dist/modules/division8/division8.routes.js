"use strict";
// modules/division8/division8.routes.ts
// Division 8 — Agency & Customer Management
//
// GET    /division/8/meta                                   contact roles + interaction types
// GET    /division/8/summary                               aggregate stats
// GET    /division/8/agencies                             list all (filter: ?status=)
// POST   /division/8/agencies                             create agency
// GET    /division/8/agencies/:agencyId                   get agency (includes contacts + interactions)
// PATCH  /division/8/agencies/:agencyId                   update agency
// POST   /division/8/agencies/:agencyId/contacts          add contact (CO/COR/KO/PM)
// DELETE /division/8/contacts/:contactId                  delete contact
// POST   /division/8/agencies/:agencyId/interactions      log interaction (NOTE/AWARD/BID/MEETING/CALL)
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const engine_1 = require("../../src/core/engine");
const division8_controller_1 = require("./division8.controller");
const router = (0, express_1.Router)();
router.get("/meta", (0, engine_1.operatorWorkflow)("DIVISION-8", "META"), division8_controller_1.division8Controller.meta);
router.get("/summary", (0, engine_1.operatorWorkflow)("DIVISION-8", "SUMMARY"), division8_controller_1.division8Controller.agencySummary);
router.get("/agencies", (0, engine_1.operatorWorkflow)("DIVISION-8", "LIST_AGENCIES"), division8_controller_1.division8Controller.listAgencies);
router.post("/agencies", (0, engine_1.operatorWorkflow)("DIVISION-8", "CREATE_AGENCY"), division8_controller_1.division8Controller.createAgency);
router.get("/agencies/:agencyId", (0, engine_1.operatorWorkflow)("DIVISION-8", "GET_AGENCY"), division8_controller_1.division8Controller.getAgency);
router.patch("/agencies/:agencyId", (0, engine_1.operatorWorkflow)("DIVISION-8", "UPDATE_AGENCY"), division8_controller_1.division8Controller.updateAgency);
router.post("/agencies/:agencyId/contacts", (0, engine_1.operatorWorkflow)("DIVISION-8", "ADD_CONTACT"), division8_controller_1.division8Controller.addContact);
router.delete("/contacts/:contactId", (0, engine_1.operatorWorkflow)("DIVISION-8", "DELETE_CONTACT"), division8_controller_1.division8Controller.deleteContact);
router.post("/agencies/:agencyId/interactions", (0, engine_1.operatorWorkflow)("DIVISION-8", "ADD_INTERACTION"), division8_controller_1.division8Controller.addInteraction);
exports.default = router;
//# sourceMappingURL=division8.routes.js.map