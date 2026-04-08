// modules/vendor-portal/vendor-portal.routes.ts
// LooseArrows Supply & Logistics™ — Vendor Portal
//
// GET    /vendor-portal              → serve HTML dashboard (public page, JS handles auth)
// GET    /vendor-portal/vendors      → list all vendors (API key required)
// GET    /vendor-portal/data         → vendor dashboard JSON (API key required, ?vendor=)
// PATCH  /vendor-portal/shipments/:id → update shipment status (API key required)

import { Router, Request, Response } from "express";
import path from "path";
import { requireApiKey } from "../../src/middleware/apiKey";
import { vendorPortalService } from "./vendor-portal.service";

const router = Router();

// ── Public: serve the HTML page ──────────────────────────────────────────────
router.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, "vendor-portal.html"));
});

// ── Key-gated data APIs ───────────────────────────────────────────────────────
router.use(requireApiKey);

router.get("/vendors", async (_req: Request, res: Response) => {
  try {
    return res.json(await vendorPortalService.listVendors());
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.get("/data", async (req: Request, res: Response) => {
  try {
    const vendor = req.query.vendor as string;
    if (!vendor) return res.status(400).json({ error: "?vendor= query param required (vendor name or ID)" });
    return res.json(await vendorPortalService.dashboard(vendor));
  } catch (e: any) {
    return res.status(404).json({ error: e.message });
  }
});

router.patch("/shipments/:id", async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;
    if (!status) return res.status(400).json({ error: "status is required" });
    return res.json(await vendorPortalService.updateShipmentStatus(req.params.id, status, notes));
  } catch (e: any) {
    return res.status(404).json({ error: e.message });
  }
});

export default router;
