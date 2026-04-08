"use strict";
// modules/dashboards/dashboards.routes.ts
// Serves the Vendor Cockpit and Operator Control Room dashboards
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// ── Vendor Cockpit ─────────────────────────────────────────────────────────────
// GET /vendor/dashboard  — Vendor-facing cockpit: opportunities, workflows, docs, compliance
router.get("/vendor/dashboard", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "vendor-dashboard.html"));
});
// ── Operator Control Room ──────────────────────────────────────────────────────
// GET /operator/dashboard — Operator-facing control room: workflows, tasks, vendors, performance
router.get("/operator/dashboard", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "operator-dashboard.html"));
});
// ── Client Demo Landing Page ───────────────────────────────────────────────────
router.get("/", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "demo.html"));
});
router.get("/demo", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "demo.html"));
});
// ── Pricing & Plans ────────────────────────────────────────────────────────────
router.get("/pricing", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "pricing.html"));
});
// ── Legal & Compliance ─────────────────────────────────────────────────────────
router.get("/legal", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "legal.html"));
});
// ── User Guide / Self-Help ─────────────────────────────────────────────────────
router.get("/guide", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "guide.html"));
});
// ── Client Onboarding ──────────────────────────────────────────────────────────
router.get("/onboarding", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "onboarding.html"));
});
// ── Client Guide (clean printable document) ────────────────────────────────────
router.get("/client-guide", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "client-guide.html"));
});
// ── Vendor Portal (key-authenticated via JS) ──────────────────────────────────
router.get("/vendor-portal", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "vendor-portal.html"));
});
// ── Quick navigation index ─────────────────────────────────────────────────────
router.get("/dashboards", (_req, res) => {
    res.json({
        vendorCockpit: "/vendor/dashboard",
        operatorControlRoom: "/operator/dashboard",
        division10Cockpit: "/division/10/dashboard",
    });
});
exports.default = router;
//# sourceMappingURL=dashboards.routes.js.map