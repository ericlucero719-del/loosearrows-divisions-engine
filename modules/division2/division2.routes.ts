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

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { division2Controller } from "./division2.controller";

const router = Router();

router.post(
  "/contracts",
  operatorWorkflow("DIVISION-2", "CREATE_CONTRACT"),
  division2Controller.createContract
);

router.get(
  "/contracts",
  operatorWorkflow("DIVISION-2", "LIST_CONTRACTS"),
  division2Controller.listContracts
);

router.get(
  "/contracts/:id",
  operatorWorkflow("DIVISION-2", "GET_CONTRACT"),
  division2Controller.getContract
);

router.post(
  "/contracts/:id/products",
  operatorWorkflow("DIVISION-2", "ADD_PRODUCT_TO_CONTRACT"),
  division2Controller.addProduct
);

router.get(
  "/contracts/:id/catalog",
  operatorWorkflow("DIVISION-2", "GET_CONTRACT_CATALOG"),
  division2Controller.getContractCatalog
);

export default router;
