"use strict";
// modules/division2/division2.routes.ts
// Division 2 — Contract Alignment
//
// Example requests:
//   POST /division/2/contracts
//     Body: { "contractName": "DoD Office Supplies", "agency": "DoD", "naics": "453210", "status": "active" }
//     Response: { "contractId": "...", "contractName": "DoD Office Supplies", ... }
//
//   POST /division/2/contracts/:id/products
//     Body: { "sku": "CF360A", "contractPrice": 130.00, "notes": "CLIN 001" }
//     Response: { "contractId": "...", "sku": "CF360A", "contractPrice": 130.00 }
//
//   GET /division/2/contracts/:id/catalog
//     Response: [{ "sku": "CF360A", "productName": "Black Toner", "contractPrice": 130.00 }]
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const engine_1 = require("../../src/core/engine");
const division2_controller_1 = require("./division2.controller");
const router = (0, express_1.Router)();
router.post("/contracts", (0, engine_1.operatorWorkflow)("DIVISION-2", "CREATE_CONTRACT"), division2_controller_1.division2Controller.createContract);
router.get("/contracts", (0, engine_1.operatorWorkflow)("DIVISION-2", "LIST_CONTRACTS"), division2_controller_1.division2Controller.listContracts);
router.get("/contracts/:id", (0, engine_1.operatorWorkflow)("DIVISION-2", "GET_CONTRACT"), division2_controller_1.division2Controller.getContract);
router.post("/contracts/:id/products", (0, engine_1.operatorWorkflow)("DIVISION-2", "ADD_PRODUCT_TO_CONTRACT"), division2_controller_1.division2Controller.addProduct);
router.patch("/contracts/:id", (0, engine_1.operatorWorkflow)("DIVISION-2", "UPDATE_CONTRACT"), division2_controller_1.division2Controller.updateContract);
router.get("/contracts/:id/catalog", (0, engine_1.operatorWorkflow)("DIVISION-2", "GET_CONTRACT_CATALOG"), division2_controller_1.division2Controller.getContractCatalog);
exports.default = router;
//# sourceMappingURL=division2.routes.js.map