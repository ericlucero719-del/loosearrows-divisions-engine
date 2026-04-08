"use strict";
// modules/billing/billing.routes.ts
// LooseArrows Supply & Logistics™ — Transaction Fee & Billing Engine
//
// GET    /api/billing/estimate           estimate fee  ?contractValue=&platform=
// GET    /api/billing/revenue            fee revenue report across all platforms
// GET    /api/billing/config             list all platform fee configs
// GET    /api/billing/config/:platform   get fee config for one platform
// POST   /api/billing/config/:platform   set/update fee config  { feeRate, minFeeUsd, maxFeeUsd? }
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const engine_1 = require("../../src/core/engine");
const billing_service_1 = require("./billing.service");
const router = (0, express_1.Router)();
router.get("/estimate", (0, engine_1.operatorWorkflow)("BILLING", "ESTIMATE"), async (req, res) => {
    try {
        const contractValue = parseFloat(req.query.contractValue);
        if (isNaN(contractValue) || contractValue <= 0)
            return res.status(400).json({ error: "contractValue must be a positive number" });
        return res.json(await billing_service_1.billingService.estimate(contractValue, req.query.platform));
    }
    catch (e) {
        return res.status(400).json({ error: e.message });
    }
});
router.get("/revenue", (0, engine_1.operatorWorkflow)("BILLING", "REVENUE_REPORT"), async (_req, res) => {
    try {
        return res.json(await billing_service_1.billingService.revenueReport());
    }
    catch (e) {
        return res.status(500).json({ error: e.message });
    }
});
router.get("/config", (0, engine_1.operatorWorkflow)("BILLING", "LIST_CONFIG"), async (_req, res) => {
    try {
        return res.json(await billing_service_1.billingService.listConfigs());
    }
    catch (e) {
        return res.status(500).json({ error: e.message });
    }
});
router.get("/config/:platform", (0, engine_1.operatorWorkflow)("BILLING", "GET_CONFIG"), async (req, res) => {
    try {
        return res.json(await billing_service_1.billingService.getConfig(req.params.platform.toUpperCase()));
    }
    catch (e) {
        return res.status(404).json({ error: e.message });
    }
});
router.post("/config/:platform", (0, engine_1.operatorWorkflow)("BILLING", "SET_CONFIG"), async (req, res) => {
    try {
        const { feeRate, minFeeUsd, maxFeeUsd, notes } = req.body;
        if (typeof feeRate !== "number")
            return res.status(400).json({ error: "feeRate (number) is required" });
        return res.json(await billing_service_1.billingService.updateConfig(req.params.platform.toUpperCase(), feeRate, minFeeUsd ?? 25, maxFeeUsd, notes));
    }
    catch (e) {
        return res.status(400).json({ error: e.message });
    }
});
exports.default = router;
//# sourceMappingURL=billing.routes.js.map