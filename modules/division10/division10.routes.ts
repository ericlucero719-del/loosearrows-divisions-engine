// modules/division10/division10.routes.ts
// Division 10 — Intelligence & System View
//
// Example requests:
//   GET /division/10/system/summary
//     Response: { "products": 5, "contracts": 2, "requests": 3, "totalActions": 47, ... }
//
//   GET /division/10/system/actions?limit=20
//     Response: last 20 operator actions across all divisions
//
//   GET /division/10/system/health
//     Response: { "status": "OK", "uptime": 3600, "timestamp": "..." }

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { division10Controller } from "./division10.controller";

const router = Router();

router.get(
  "/system/summary",
  operatorWorkflow("DIVISION-10", "VIEW_SYSTEM_SUMMARY"),
  division10Controller.getSystemSummary
);

router.get(
  "/system/actions",
  operatorWorkflow("DIVISION-10", "VIEW_SYSTEM_ACTIONS"),
  division10Controller.getActions
);

router.get(
  "/system/health",
  operatorWorkflow("DIVISION-10", "VIEW_SYSTEM_HEALTH"),
  division10Controller.getSystemHealth
);

router.get(
  "/system/operator",
  operatorWorkflow("DIVISION-10", "VIEW_OPERATOR_INFO"),
  division10Controller.getOperatorInfo
);

export default router;
