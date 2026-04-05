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
import path from "path";
import { operatorWorkflow } from "../../src/core/engine";
import { division10Controller } from "./division10.controller";

const router = Router();

// ── Core ──────────────────────────────────────────────────────────────────────
router.get("/system/summary",  operatorWorkflow("DIVISION-10", "VIEW_SYSTEM_SUMMARY"),  division10Controller.getSystemSummary);
router.get("/system/actions",  operatorWorkflow("DIVISION-10", "VIEW_SYSTEM_ACTIONS"),  division10Controller.getActions);
router.get("/system/health",   operatorWorkflow("DIVISION-10", "VIEW_SYSTEM_HEALTH"),   division10Controller.getSystemHealth);
router.get("/system/operator", operatorWorkflow("DIVISION-10", "VIEW_OPERATOR_INFO"),   division10Controller.getOperatorInfo);

// ── Intelligence endpoints ────────────────────────────────────────────────────
router.get("/intelligence/financials", operatorWorkflow("DIVISION-10", "VIEW_FINANCIALS"), division10Controller.getFinancials);
router.get("/intelligence/inventory",  operatorWorkflow("DIVISION-10", "VIEW_INVENTORY"),  division10Controller.getInventory);
router.get("/intelligence/operators",  operatorWorkflow("DIVISION-10", "VIEW_OPERATORS"),  division10Controller.getOperators);
router.get("/intelligence/contracts",  operatorWorkflow("DIVISION-10", "VIEW_CONTRACTS"),  division10Controller.getContracts);
router.get("/intelligence/alerts",     operatorWorkflow("DIVISION-10", "VIEW_ALERTS"),     division10Controller.getAlerts);
router.get("/intelligence/margins",    operatorWorkflow("DIVISION-10", "VIEW_MARGINS"),    division10Controller.getMargins);
router.get("/intelligence/supply",     operatorWorkflow("DIVISION-10", "VIEW_SUPPLY"),     division10Controller.getSupply);
router.get("/intelligence/pipeline",    operatorWorkflow("DIVISION-10", "VIEW_PIPELINE"),    division10Controller.getPipeline);
router.get("/intelligence/assessment",  operatorWorkflow("DIVISION-10", "VIEW_ASSESSMENT"),  division10Controller.getAssessment);
router.get("/intelligence/report",     operatorWorkflow("DIVISION-10", "VIEW_FULL_REPORT"), division10Controller.getFullReport);

// ── Relic Feed ────────────────────────────────────────────────────────────────
router.get( "/relics", operatorWorkflow("DIVISION-10", "VIEW_RELICS"),   division10Controller.getRelics);
router.post("/relics", operatorWorkflow("DIVISION-10", "CREATE_RELIC"),  division10Controller.createRelic);

// ── Cyberpunk dashboard UI ────────────────────────────────────────────────────
router.get("/dashboard", (_req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

export default router;
