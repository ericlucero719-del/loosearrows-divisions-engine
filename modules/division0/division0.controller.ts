// modules/division0/division0.controller.ts
// Division 0 — System Command Center

import { Request, Response } from "express";
import { division0Service } from "./division0.service";

export const division0Controller = {

  async fullStatus(_req: Request, res: Response) {
    try {
      return res.json(await division0Service.fullSystemStatus());
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async pipeline(_req: Request, res: Response) {
    try {
      return res.json(await division0Service.pipelineSummary());
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async financials(_req: Request, res: Response) {
    try {
      return res.json(await division0Service.financialRollup());
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async vendors(_req: Request, res: Response) {
    try {
      return res.json(await division0Service.vendorRoster());
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async contracts(_req: Request, res: Response) {
    try {
      return res.json(await division0Service.contractRoster());
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async activity(req: Request, res: Response) {
    try {
      const limit = Math.min(parseInt((req.query.limit as string) ?? "20"), 100);
      return res.json(await division0Service.recentActivity(limit));
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  },
};
