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

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { division8Controller } from "./division8.controller";

const router = Router();

router.get("/meta", operatorWorkflow("DIVISION-8", "META"), division8Controller.meta);
router.get("/summary", operatorWorkflow("DIVISION-8", "SUMMARY"), division8Controller.agencySummary);

router.get("/agencies", operatorWorkflow("DIVISION-8", "LIST_AGENCIES"), division8Controller.listAgencies);
router.post("/agencies", operatorWorkflow("DIVISION-8", "CREATE_AGENCY"), division8Controller.createAgency);

router.get("/agencies/:agencyId", operatorWorkflow("DIVISION-8", "GET_AGENCY"), division8Controller.getAgency);
router.patch("/agencies/:agencyId", operatorWorkflow("DIVISION-8", "UPDATE_AGENCY"), division8Controller.updateAgency);

router.post("/agencies/:agencyId/contacts", operatorWorkflow("DIVISION-8", "ADD_CONTACT"), division8Controller.addContact);
router.delete("/contacts/:contactId", operatorWorkflow("DIVISION-8", "DELETE_CONTACT"), division8Controller.deleteContact);

router.post("/agencies/:agencyId/interactions", operatorWorkflow("DIVISION-8", "ADD_INTERACTION"), division8Controller.addInteraction);

export default router;
