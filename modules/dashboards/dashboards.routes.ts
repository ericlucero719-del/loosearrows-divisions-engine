// modules/dashboards/dashboards.routes.ts
// Serves the Vendor Cockpit and Operator Control Room dashboards

import { Router } from "express";
import path from "path";

const router = Router();

// ── Vendor Cockpit ─────────────────────────────────────────────────────────────
// GET /vendor/dashboard  — Vendor-facing cockpit: opportunities, workflows, docs, compliance
router.get("/vendor/dashboard", (_req, res) => {
  res.sendFile(path.join(__dirname, "vendor-dashboard.html"));
});

// ── Operator Control Room ──────────────────────────────────────────────────────
// GET /operator/dashboard — Operator-facing control room: workflows, tasks, vendors, performance
router.get("/operator/dashboard", (_req, res) => {
  res.sendFile(path.join(__dirname, "operator-dashboard.html"));
});

// ── Quick navigation index ─────────────────────────────────────────────────────
router.get("/dashboards", (_req, res) => {
  res.json({
    vendorCockpit:        "/vendor/dashboard",
    operatorControlRoom:  "/operator/dashboard",
    division10Cockpit:    "/division/10/dashboard",
  });
});

export default router;
