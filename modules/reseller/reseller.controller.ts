// modules/reseller/reseller.controller.ts
import { Request, Response } from "express";
import { resellerService } from "./reseller.service";

export const resellerController = {

  async register(req: Request, res: Response) {
    try {
      const { name, email, platform, notes } = req.body;
      if (!name || !email) return res.status(400).json({ error: "name and email are required" });
      return res.status(201).json(await resellerService.registerReseller({ name, email, platform, notes }));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async list(req: Request, res: Response) {
    try {
      return res.json(await resellerService.listResellers(
        req.query.status as string, req.query.tier as string,
      ));
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async get(req: Request, res: Response) {
    try { return res.json(await resellerService.getReseller(req.params.id)); }
    catch (e: any) { return res.status(404).json({ error: e.message }); }
  },

  async earnings(req: Request, res: Response) {
    try { return res.json(await resellerService.getEarnings(req.params.id)); }
    catch (e: any) { return res.status(404).json({ error: e.message }); }
  },

  async recordSale(req: Request, res: Response) {
    try {
      const { grossSaleUsd } = req.body;
      if (!grossSaleUsd) return res.status(400).json({ error: "grossSaleUsd required" });
      return res.json(await resellerService.recordSale(req.params.id, grossSaleUsd));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async payout(req: Request, res: Response) {
    try {
      const { method, reference, notes } = req.body;
      return res.json(await resellerService.processPayout(req.params.id, method, reference, notes));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async summary(req: Request, res: Response) {
    try { return res.json(await resellerService.getResellerSummary()); }
    catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async simulate(req: Request, res: Response) {
    try {
      const count = parseInt(req.query.resellers as string) || 20000;
      const gmv   = parseFloat(req.query.gmv as string)    || 1000;
      return res.json(resellerService.simulateScale(count, gmv));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async tiers(_req: Request, res: Response) {
    return res.json(resellerService.TIERS);
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: "status required" });
      return res.json(await resellerService.updateResellerStatus(req.params.id, status));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },
};
