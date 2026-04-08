"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const engine_1 = require("../../src/core/engine");
const division10_controller_1 = require("./division10.controller");
const router = (0, express_1.Router)();
// ── Core ──────────────────────────────────────────────────────────────────────
router.get("/system/summary", (0, engine_1.operatorWorkflow)("DIVISION-10", "VIEW_SYSTEM_SUMMARY"), division10_controller_1.division10Controller.getSystemSummary);
router.get("/system/actions", (0, engine_1.operatorWorkflow)("DIVISION-10", "VIEW_SYSTEM_ACTIONS"), division10_controller_1.division10Controller.getActions);
router.get("/system/health", (0, engine_1.operatorWorkflow)("DIVISION-10", "VIEW_SYSTEM_HEALTH"), division10_controller_1.division10Controller.getSystemHealth);
router.get("/system/operator", (0, engine_1.operatorWorkflow)("DIVISION-10", "VIEW_OPERATOR_INFO"), division10_controller_1.division10Controller.getOperatorInfo);
// ── Intelligence endpoints ────────────────────────────────────────────────────
router.get("/intelligence/financials", (0, engine_1.operatorWorkflow)("DIVISION-10", "VIEW_FINANCIALS"), division10_controller_1.division10Controller.getFinancials);
router.get("/intelligence/inventory", (0, engine_1.operatorWorkflow)("DIVISION-10", "VIEW_INVENTORY"), division10_controller_1.division10Controller.getInventory);
router.get("/intelligence/operators", (0, engine_1.operatorWorkflow)("DIVISION-10", "VIEW_OPERATORS"), division10_controller_1.division10Controller.getOperators);
router.get("/intelligence/contracts", (0, engine_1.operatorWorkflow)("DIVISION-10", "VIEW_CONTRACTS"), division10_controller_1.division10Controller.getContracts);
router.get("/intelligence/alerts", (0, engine_1.operatorWorkflow)("DIVISION-10", "VIEW_ALERTS"), division10_controller_1.division10Controller.getAlerts);
router.get("/intelligence/margins", (0, engine_1.operatorWorkflow)("DIVISION-10", "VIEW_MARGINS"), division10_controller_1.division10Controller.getMargins);
router.get("/intelligence/supply", (0, engine_1.operatorWorkflow)("DIVISION-10", "VIEW_SUPPLY"), division10_controller_1.division10Controller.getSupply);
router.get("/intelligence/pipeline", (0, engine_1.operatorWorkflow)("DIVISION-10", "VIEW_PIPELINE"), division10_controller_1.division10Controller.getPipeline);
router.get("/intelligence/assessment", (0, engine_1.operatorWorkflow)("DIVISION-10", "VIEW_ASSESSMENT"), division10_controller_1.division10Controller.getAssessment);
router.get("/intelligence/report", (0, engine_1.operatorWorkflow)("DIVISION-10", "VIEW_FULL_REPORT"), division10_controller_1.division10Controller.getFullReport);
// ── Relic Feed ────────────────────────────────────────────────────────────────
router.get("/relics", (0, engine_1.operatorWorkflow)("DIVISION-10", "VIEW_RELICS"), division10_controller_1.division10Controller.getRelics);
router.post("/relics", (0, engine_1.operatorWorkflow)("DIVISION-10", "CREATE_RELIC"), division10_controller_1.division10Controller.createRelic);
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
router.get("/bot/status", (0, engine_1.operatorWorkflow)("DIVISION-10", "BOT_STATUS"), division10_controller_1.division10Controller.botGetStatus);
router.post("/bot/run", (0, engine_1.operatorWorkflow)("DIVISION-10", "BOT_RUN_CYCLE"), division10_controller_1.division10Controller.botRunCycle);
router.get("/bot/cycles", (0, engine_1.operatorWorkflow)("DIVISION-10", "BOT_CYCLES"), division10_controller_1.division10Controller.botGetCycles);
router.get("/bot/opportunities", (0, engine_1.operatorWorkflow)("DIVISION-10", "BOT_LIST_OPPS"), division10_controller_1.division10Controller.botListOpportunities);
router.post("/bot/opportunities", (0, engine_1.operatorWorkflow)("DIVISION-10", "BOT_INGEST_OPP"), division10_controller_1.division10Controller.botIngestOpportunity);
router.get("/bot/opportunities/:id", (0, engine_1.operatorWorkflow)("DIVISION-10", "BOT_GET_OPP"), division10_controller_1.division10Controller.botGetOpportunity);
router.post("/bot/opportunities/:id/analyze", (0, engine_1.operatorWorkflow)("DIVISION-10", "BOT_ANALYZE"), division10_controller_1.division10Controller.botAnalyzeOpportunity);
router.post("/bot/opportunities/:id/match", (0, engine_1.operatorWorkflow)("DIVISION-10", "BOT_MATCH"), division10_controller_1.division10Controller.botMatchSuppliers);
router.post("/bot/opportunities/:id/draft", (0, engine_1.operatorWorkflow)("DIVISION-10", "BOT_DRAFT"), division10_controller_1.division10Controller.botPrepDraft);
router.get("/bot/relics", (0, engine_1.operatorWorkflow)("DIVISION-10", "BOT_RELICS"), division10_controller_1.division10Controller.botGetRelics);
router.get("/bot/alerts", (0, engine_1.operatorWorkflow)("DIVISION-10", "BOT_ALERTS"), division10_controller_1.division10Controller.botGetAlerts);
router.post("/bot/alerts/:id/acknowledge", (0, engine_1.operatorWorkflow)("DIVISION-10", "BOT_ACK_ALERT"), division10_controller_1.division10Controller.botAcknowledgeAlert);
router.get("/bot/reports/daily", (0, engine_1.operatorWorkflow)("DIVISION-10", "BOT_DAILY_SUMMARY"), division10_controller_1.division10Controller.botGetDailySummary);
router.get("/bot/reports/weekly", (0, engine_1.operatorWorkflow)("DIVISION-10", "BOT_WEEKLY_REPORT"), division10_controller_1.division10Controller.botGetWeeklyReport);
// ── Architect Command Layer ───────────────────────────────────────────────────
//   GET  /division/10/bot/architect/authority              Authority manifest + command protocol
//   GET  /division/10/bot/architect/commands               Full command log  ?oppId=
//
//   GET  /division/10/bot/opportunities/:id/escalation     Structured escalation packet (spec format)
//   POST /division/10/bot/opportunities/:id/architect-command
//          Body: { "command": "Proceed"|"Hold"|"Decline"|"Revise"|"More info", "notes": "..." }
router.get("/bot/architect/authority", (0, engine_1.operatorWorkflow)("DIVISION-10", "BOT_ARCHITECT_AUTHORITY"), division10_controller_1.division10Controller.botGetArchitectAuthority);
router.get("/bot/architect/commands", (0, engine_1.operatorWorkflow)("DIVISION-10", "BOT_COMMAND_LOG"), division10_controller_1.division10Controller.botGetCommandLog);
router.get("/bot/opportunities/:id/escalation", (0, engine_1.operatorWorkflow)("DIVISION-10", "BOT_ESCALATION"), division10_controller_1.division10Controller.botGetEscalation);
router.post("/bot/opportunities/:id/architect-command", (0, engine_1.operatorWorkflow)("DIVISION-10", "BOT_ARCH_COMMAND"), division10_controller_1.division10Controller.botArchitectCommand);
// ── Cyberpunk dashboard UI ────────────────────────────────────────────────────
router.get("/dashboard", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "dashboard.html"));
});
exports.default = router;
//# sourceMappingURL=division10.routes.js.map