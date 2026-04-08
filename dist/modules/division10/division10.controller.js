"use strict";
// modules/division10/division10.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.division10Controller = void 0;
const division10_service_1 = require("./division10.service");
const division10_bot_service_1 = require("./division10.bot.service");
exports.division10Controller = {
    getSystemSummary(_req, res) {
        return res.json(division10_service_1.division10Service.getSystemSummary());
    },
    getActions(req, res) {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        return res.json(division10_service_1.division10Service.getActions(limit));
    },
    async getSystemHealth(_req, res) {
        return res.json(await division10_service_1.division10Service.getSystemHealth());
    },
    getRelics(_req, res) {
        return res.json(division10_service_1.division10Service.getRelics());
    },
    createRelic(req, res) {
        const { type, source, entity, meaning, timestamp, operatorId, divisionId } = req.body ?? {};
        if (!type || !source || !entity || !meaning) {
            return res.status(400).json({ error: "type, source, entity, and meaning are required." });
        }
        const valid = ["Engagement", "Contract", "Shipment", "Operator", "Supply", "System", "Custom"];
        if (!valid.includes(type)) {
            return res.status(400).json({ error: `type must be one of: ${valid.join(", ")}` });
        }
        const relic = division10_service_1.division10Service.createRelic({ type, source, entity, meaning, timestamp, operatorId, divisionId });
        return res.status(201).json(relic);
    },
    getOperatorInfo(_req, res) {
        return res.json(division10_service_1.division10Service.getOperatorInfo());
    },
    getFinancials(_req, res) {
        return res.json(division10_service_1.division10Service.getFinancials());
    },
    getInventory(_req, res) {
        return res.json(division10_service_1.division10Service.getInventory());
    },
    getOperators(_req, res) {
        return res.json(division10_service_1.division10Service.getOperators());
    },
    getContracts(_req, res) {
        return res.json(division10_service_1.division10Service.getContracts());
    },
    getAlerts(_req, res) {
        return res.json(division10_service_1.division10Service.getAlerts());
    },
    async getFullReport(_req, res) {
        return res.json(await division10_service_1.division10Service.getFullReport());
    },
    getMargins(_req, res) {
        return res.json(division10_service_1.division10Service.getMargins());
    },
    getSupply(_req, res) {
        return res.json(division10_service_1.division10Service.getSupply());
    },
    getPipeline(_req, res) {
        return res.json(division10_service_1.division10Service.getPipeline());
    },
    getAssessment(_req, res) {
        return res.json(division10_service_1.division10Service.getAssessment());
    },
    // ── Operator Bot ──────────────────────────────────────────────────────────
    botGetStatus(_req, res) {
        return res.json(division10_bot_service_1.botService.getStatus());
    },
    botRunCycle(_req, res) {
        const summary = division10_bot_service_1.botService.runCycle();
        return res.json(summary);
    },
    botListOpportunities(req, res) {
        const { status } = req.query;
        return res.json(division10_bot_service_1.botService.listOpportunities(status));
    },
    botGetOpportunity(req, res) {
        const opp = division10_bot_service_1.botService.getOpportunity(req.params.id);
        if (!opp)
            return res.status(404).json({ error: "Opportunity not found" });
        return res.json(opp);
    },
    botIngestOpportunity(req, res) {
        const { solicitationNumber, title, agency } = req.body ?? {};
        if (!solicitationNumber || !title || !agency) {
            return res.status(400).json({ error: "solicitationNumber, title, and agency are required" });
        }
        const opp = division10_bot_service_1.botService.ingestOpportunity(req.body);
        return res.status(201).json(opp);
    },
    botAnalyzeOpportunity(req, res) {
        const result = division10_bot_service_1.botService.analyzeOpportunity(req.params.id);
        if ("error" in result)
            return res.status(404).json(result);
        return res.json(result);
    },
    botMatchSuppliers(req, res) {
        const result = division10_bot_service_1.botService.matchSuppliers(req.params.id);
        if (!Array.isArray(result) && "error" in result)
            return res.status(404).json(result);
        return res.json(result);
    },
    botPrepDraft(req, res) {
        const result = division10_bot_service_1.botService.prepDraft(req.params.id);
        if ("error" in result)
            return res.status(404).json(result);
        return res.json(result);
    },
    botGetRelics(req, res) {
        const { type, oppId, limit } = req.query;
        return res.json(division10_bot_service_1.botService.getRelics(type, oppId, limit ? parseInt(limit) : undefined));
    },
    botGetAlerts(req, res) {
        const { severity, unacknowledged } = req.query;
        const ack = unacknowledged === "true" ? false : undefined;
        return res.json(division10_bot_service_1.botService.getAlerts(severity, ack));
    },
    botGetDailySummary(_req, res) {
        return res.json(division10_bot_service_1.botService.getDailySummary());
    },
    botGetWeeklyReport(_req, res) {
        return res.json(division10_bot_service_1.botService.getWeeklyReport());
    },
    botAcknowledgeAlert(req, res) {
        const result = division10_bot_service_1.botService.acknowledgeAlert(req.params.id);
        if ("error" in result)
            return res.status(404).json(result);
        return res.json(result);
    },
    // ── Architect Command Layer ──────────────────────────────────────────────
    botGetEscalation(req, res) {
        const result = division10_bot_service_1.botService.buildEscalationPacket(req.params.id);
        if ("error" in result)
            return res.status(404).json(result);
        return res.json(result);
    },
    async botArchitectCommand(req, res) {
        const { command, notes } = req.body ?? {};
        const VALID = ["Proceed", "Hold", "Decline", "Revise", "More info"];
        if (!command) {
            return res.status(400).json({
                error: "command is required",
                accepted: VALID,
                note: "Bot will not interpret ambiguous language as approval.",
            });
        }
        if (!VALID.includes(command)) {
            return res.status(400).json({
                error: `'${command}' is not a valid Architect command.`,
                accepted: VALID,
                note: "Bot will not interpret ambiguous language as approval.",
            });
        }
        const result = await division10_bot_service_1.botService.issueArchitectCommand(req.params.id, command, notes);
        if ("error" in result)
            return res.status(404).json(result);
        return res.json(result);
    },
    botGetCommandLog(req, res) {
        const { oppId } = req.query;
        return res.json(division10_bot_service_1.botService.getCommandLog(oppId));
    },
    botGetArchitectAuthority(_req, res) {
        return res.json(division10_bot_service_1.botService.getArchitectAuthority());
    },
    botGetCycles(req, res) {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        return res.json(division10_bot_service_1.botService.getCycles(limit));
    },
};
//# sourceMappingURL=division10.controller.js.map