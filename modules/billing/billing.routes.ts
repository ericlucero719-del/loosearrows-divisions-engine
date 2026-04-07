// modules/billing/billing.routes.ts
// LooseArrows Supply & Logistics™ — Transaction Fee & Billing Engine
//
// GET    /api/billing/estimate           estimate fee  ?contractValue=&platform=
// GET    /api/billing/revenue            fee revenue report across all platforms
// GET    /api/billing/config             list all platform fee configs
// GET    /api/billing/config/:platform   get fee config for one platform
// POST   /api/billing/config/:platform   set/update fee config  { feeRate, minFeeUsd, maxFeeUsd? }

import { Router, Request, Response } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { billingService } from "./billing.service";

const router = Router();

router.get("/estimate", operatorWorkflow("BILLING", "ESTIMATE"), async (req: Request, res: Response) => {
  try {
    const contractValue = parseFloat(req.query.contractValue as string);
    if (isNaN(contractValue) || contractValue <= 0)
      return res.status(400).json({ error: "contractValue must be a positive number" });
    return res.json(await billingService.estimate(contractValue, req.query.platform as string));
  } catch (e: any) { return res.status(400).json({ error: e.message }); }
});

router.get("/revenue", operatorWorkflow("BILLING", "REVENUE_REPORT"), async (_req: Request, res: Response) => {
  try { return res.json(await billingService.revenueReport()); }
  catch (e: any) { return res.status(500).json({ error: e.message }); }
});

router.get("/config", operatorWorkflow("BILLING", "LIST_CONFIG"), async (_req: Request, res: Response) => {
  try { return res.json(await billingService.listConfigs()); }
  catch (e: any) { return res.status(500).json({ error: e.message }); }
});

router.get("/config/:platform", operatorWorkflow("BILLING", "GET_CONFIG"), async (req: Request, res: Response) => {
  try { return res.json(await billingService.getConfig(req.params.platform.toUpperCase())); }
  catch (e: any) { return res.status(404).json({ error: e.message }); }
});

router.post("/config/:platform", operatorWorkflow("BILLING", "SET_CONFIG"), async (req: Request, res: Response) => {
  try {
    const { feeRate, minFeeUsd, maxFeeUsd, notes } = req.body;
    if (typeof feeRate !== "number") return res.status(400).json({ error: "feeRate (number) is required" });
    return res.json(await billingService.updateConfig(
      req.params.platform.toUpperCase(), feeRate, minFeeUsd ?? 25, maxFeeUsd, notes
    ));
  } catch (e: any) { return res.status(400).json({ error: e.message }); }
});

export default router;
