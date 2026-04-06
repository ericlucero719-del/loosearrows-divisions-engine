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

// ── Operator Bot ──────────────────────────────────────────────────────────────
//   GET  /division/10/bot/status                      Bot identity, hard rules, mission state
//   POST /division/10/bot/run                         Trigger a full intelligence cycle (A→F)
//   GET  /division/10/bot/cycles                      Past cycle summaries
//
//   GET  /division/10/bot/opportunities               List all tracked opportunities  ?status=
//   POST /division/10/bot/opportunities               Manually ingest an opportunity
//   GET  /division/10/bot/opportunities/:id           Get single opportunity
//   POST /division/10/bot/opportunities/:id/analyze   Run Behavior B (analysis)
//   POST /division/10/bot/opportunities/:id/match     Run Behavior C (supplier match)
//   POST /division/10/bot/opportunities/:id/draft     Run Behavior D (draft quote prep)
//
//   GET  /division/10/bot/relics                      All bot relics  ?type= ?oppId= ?limit=
//   GET  /division/10/bot/alerts                      All bot alerts  ?level= ?unacknowledged=true
//   POST /division/10/bot/alerts/:id/acknowledge      Architect acknowledges an alert

router.get( "/bot/status", operatorWorkflow("DIVISION-10", "BOT_STATUS"), division10Controller.botGetStatus);
router.post("/bot/run",    operatorWorkflow("DIVISION-10", "BOT_RUN_CYCLE"), division10Controller.botRunCycle);
router.get( "/bot/cycles", operatorWorkflow("DIVISION-10", "BOT_CYCLES"), division10Controller.botGetCycles);

router.get( "/bot/opportunities",     operatorWorkflow("DIVISION-10", "BOT_LIST_OPPS"),   division10Controller.botListOpportunities);
router.post("/bot/opportunities",     operatorWorkflow("DIVISION-10", "BOT_INGEST_OPP"),  division10Controller.botIngestOpportunity);
router.get( "/bot/opportunities/:id", operatorWorkflow("DIVISION-10", "BOT_GET_OPP"),     division10Controller.botGetOpportunity);

router.post("/bot/opportunities/:id/analyze", operatorWorkflow("DIVISION-10", "BOT_ANALYZE"), division10Controller.botAnalyzeOpportunity);
router.post("/bot/opportunities/:id/match",   operatorWorkflow("DIVISION-10", "BOT_MATCH"),   division10Controller.botMatchSuppliers);
router.post("/bot/opportunities/:id/draft",   operatorWorkflow("DIVISION-10", "BOT_DRAFT"),   division10Controller.botPrepDraft);

router.get( "/bot/relics", operatorWorkflow("DIVISION-10", "BOT_RELICS"), division10Controller.botGetRelics);
router.get( "/bot/alerts", operatorWorkflow("DIVISION-10", "BOT_ALERTS"), division10Controller.botGetAlerts);
router.post("/bot/alerts/:id/acknowledge", operatorWorkflow("DIVISION-10", "BOT_ACK_ALERT"), division10Controller.botAcknowledgeAlert);

// ── Cyberpunk dashboard UI ────────────────────────────────────────────────────
router.get("/dashboard", (_req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

export default router;
