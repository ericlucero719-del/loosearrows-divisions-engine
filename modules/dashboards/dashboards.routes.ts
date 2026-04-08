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

// ── Client Demo Landing Page ───────────────────────────────────────────────────
router.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "demo.html"));
});
router.get("/demo", (_req, res) => {
  res.sendFile(path.join(__dirname, "demo.html"));
});

// ── Pricing & Plans ────────────────────────────────────────────────────────────
router.get("/pricing", (_req, res) => {
  res.sendFile(path.join(__dirname, "pricing.html"));
});

// ── Legal & Compliance ─────────────────────────────────────────────────────────
router.get("/legal", (_req, res) => {
  res.sendFile(path.join(__dirname, "legal.html"));
});

// ── User Guide / Self-Help ─────────────────────────────────────────────────────
router.get("/guide", (_req, res) => {
  res.sendFile(path.join(__dirname, "guide.html"));
});

// ── Client Onboarding ──────────────────────────────────────────────────────────
router.get("/onboarding", (_req, res) => {
  res.sendFile(path.join(__dirname, "onboarding.html"));
});

// ── Client Guide (clean printable document) ────────────────────────────────────
router.get("/client-guide", (_req, res) => {
  res.sendFile(path.join(__dirname, "client-guide.html"));
});

router.get("/command-center", (_req, res) => {
  res.sendFile(path.join(__dirname, "command-center.html"));
});

// ── Reseller Signup ────────────────────────────────────────────────────────────
router.get("/join", (_req, res) => {
  res.sendFile(path.join(__dirname, "join.html"));
});
router.get("/join/success", (_req, res) => {
  res.sendFile(path.join(__dirname, "join-success.html"));
});

// ── Quick navigation index ─────────────────────────────────────────────────────
router.get("/dashboards", (_req, res) => {
  res.json({
    commandCenter:        "/command-center",
    vendorCockpit:        "/vendor/dashboard",
    operatorControlRoom:  "/operator/dashboard",
    division10Cockpit:    "/division/10/dashboard",
  });
});

export default router;
