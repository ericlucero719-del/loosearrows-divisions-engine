"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const engine_1 = require("../../src/core/engine");
const division7_controller_1 = require("./division7.controller");
const router = (0, express_1.Router)();
router.post("/vendors", (0, engine_1.operatorWorkflow)("DIVISION-7", "CREATE_VENDOR"), division7_controller_1.division7Controller.createVendor);
router.get("/vendors", (0, engine_1.operatorWorkflow)("DIVISION-7", "LIST_VENDORS"), division7_controller_1.division7Controller.listVendors);
router.get("/vendors/:id", (0, engine_1.operatorWorkflow)("DIVISION-7", "GET_VENDOR"), division7_controller_1.division7Controller.getVendor);
router.put("/vendors/:id", (0, engine_1.operatorWorkflow)("DIVISION-7", "UPDATE_VENDOR"), division7_controller_1.division7Controller.updateVendor);
router.post("/vendors/:id/attach", (0, engine_1.operatorWorkflow)("DIVISION-7", "ATTACH_VENDOR"), division7_controller_1.division7Controller.attachVendor);
exports.default = router;
//# sourceMappingURL=division7.routes.js.map