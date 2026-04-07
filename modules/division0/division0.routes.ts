// modules/division0/division0.routes.ts
// Division 0 — System Command Center (admin-only via X-Admin-Secret)
//
// GET /division/0/status          full system status — all 11 divisions with record counts
// GET /division/0/pipeline        pipeline summary — contracts → bids → POs → shipments → invoices
// GET /division/0/financials      financial rollup — PO value, invoiced, paid, outstanding
// GET /division/0/vendors         vendor roster — all vendors with categories and status
// GET /division/0/contracts       contract roster — all contracts with status and value
// GET /division/0/activity        recent activity feed — last N events across all divisions

import { Router, Request, Response, NextFunction } from "express";
import { division0Controller } from "./division0.controller";

const router = Router();

function adminOnly(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers["x-admin-secret"] as string | undefined;
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: "Admin access required. Provide X-Admin-Secret header." });
  }
  return next();
}

router.use(adminOnly);

router.get("/status",    division0Controller.fullStatus);
router.get("/pipeline",  division0Controller.pipeline);
router.get("/financials", division0Controller.financials);
router.get("/vendors",   division0Controller.vendors);
router.get("/contracts", division0Controller.contracts);
router.get("/activity",  division0Controller.activity);

export default router;
