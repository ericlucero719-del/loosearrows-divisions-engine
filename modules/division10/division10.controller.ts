// modules/division10/division10.controller.ts

import { Request, Response } from "express";
import { division10Service } from "./division10.service";
import { botService } from "./division10.bot.service";

export const division10Controller = {
  getSystemSummary(_req: Request, res: Response) {
    return res.json(division10Service.getSystemSummary());
  },

  getActions(req: Request, res: Response) {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    return res.json(division10Service.getActions(limit));
  },

  getSystemHealth(_req: Request, res: Response) {
    return res.json(division10Service.getSystemHealth());
  },

  getRelics(_req: Request, res: Response) {
    return res.json(division10Service.getRelics());
  },

  createRelic(req: Request, res: Response) {
    const { type, source, entity, meaning, timestamp, operatorId, divisionId } = req.body ?? {};
    if (!type || !source || !entity || !meaning) {
      return res.status(400).json({ error: "type, source, entity, and meaning are required." });
    }
    const valid = ["Engagement","Contract","Shipment","Operator","Supply","System","Custom"];
    if (!valid.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${valid.join(", ")}` });
    }
    const relic = division10Service.createRelic({ type, source, entity, meaning, timestamp, operatorId, divisionId });
    return res.status(201).json(relic);
  },

  getOperatorInfo(_req: Request, res: Response) {
    return res.json(division10Service.getOperatorInfo());
  },

  getFinancials(_req: Request, res: Response) {
    return res.json(division10Service.getFinancials());
  },

  getInventory(_req: Request, res: Response) {
    return res.json(division10Service.getInventory());
  },

  getOperators(_req: Request, res: Response) {
    return res.json(division10Service.getOperators());
  },

  getContracts(_req: Request, res: Response) {
    return res.json(division10Service.getContracts());
  },

  getAlerts(_req: Request, res: Response) {
    return res.json(division10Service.getAlerts());
  },

  getFullReport(_req: Request, res: Response) {
    return res.json(division10Service.getFullReport());
  },

  getMargins(_req: Request, res: Response) {
    return res.json(division10Service.getMargins());
  },

  getSupply(_req: Request, res: Response) {
    return res.json(division10Service.getSupply());
  },

  getPipeline(_req: Request, res: Response) {
    return res.json(division10Service.getPipeline());
  },

  getAssessment(_req: Request, res: Response) {
    return res.json(division10Service.getAssessment());
  },

  // ── Operator Bot ──────────────────────────────────────────────────────────

  botGetStatus(_req: Request, res: Response) {
    return res.json(botService.getStatus());
  },

  botRunCycle(_req: Request, res: Response) {
    const summary = botService.runCycle();
    return res.json(summary);
  },

  botListOpportunities(req: Request, res: Response) {
    const { status } = req.query as { status?: any };
    return res.json(botService.listOpportunities(status));
  },

  botGetOpportunity(req: Request, res: Response) {
    const opp = botService.getOpportunity(req.params.id);
    if (!opp) return res.status(404).json({ error: "Opportunity not found" });
    return res.json(opp);
  },

  botIngestOpportunity(req: Request, res: Response) {
    const { solicitationNumber, title, agency } = req.body ?? {};
    if (!solicitationNumber || !title || !agency) {
      return res.status(400).json({ error: "solicitationNumber, title, and agency are required" });
    }
    const opp = botService.ingestOpportunity(req.body);
    return res.status(201).json(opp);
  },

  botAnalyzeOpportunity(req: Request, res: Response) {
    const result = botService.analyzeOpportunity(req.params.id);
    if ("error" in result) return res.status(404).json(result);
    return res.json(result);
  },

  botMatchSuppliers(req: Request, res: Response) {
    const result = botService.matchSuppliers(req.params.id);
    if (!Array.isArray(result) && "error" in result) return res.status(404).json(result);
    return res.json(result);
  },

  botPrepDraft(req: Request, res: Response) {
    const result = botService.prepDraft(req.params.id);
    if ("error" in result) return res.status(404).json(result);
    return res.json(result);
  },

  botGetRelics(req: Request, res: Response) {
    const { type, oppId, limit } = req.query as { type?: any; oppId?: string; limit?: string };
    return res.json(botService.getRelics(type, oppId, limit ? parseInt(limit) : undefined));
  },

  botGetAlerts(req: Request, res: Response) {
    const { severity, unacknowledged } = req.query as { severity?: any; unacknowledged?: string };
    const ack = unacknowledged === "true" ? false : undefined;
    return res.json(botService.getAlerts(severity, ack));
  },

  botGetDailySummary(_req: Request, res: Response) {
    return res.json(botService.getDailySummary());
  },

  botGetWeeklyReport(_req: Request, res: Response) {
    return res.json(botService.getWeeklyReport());
  },

  botAcknowledgeAlert(req: Request, res: Response) {
    const result = botService.acknowledgeAlert(req.params.id);
    if ("error" in result) return res.status(404).json(result);
    return res.json(result);
  },

  botGetCycles(req: Request, res: Response) {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    return res.json(botService.getCycles(limit));
  },
};
