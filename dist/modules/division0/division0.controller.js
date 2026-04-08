"use strict";
// modules/division0/division0.controller.ts
// Division 0 — System Command Center
Object.defineProperty(exports, "__esModule", { value: true });
exports.division0Controller = void 0;
const division0_service_1 = require("./division0.service");
exports.division0Controller = {
    async fullStatus(_req, res) {
        try {
            return res.json(await division0_service_1.division0Service.fullSystemStatus());
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async pipeline(_req, res) {
        try {
            return res.json(await division0_service_1.division0Service.pipelineSummary());
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async financials(_req, res) {
        try {
            return res.json(await division0_service_1.division0Service.financialRollup());
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async vendors(_req, res) {
        try {
            return res.json(await division0_service_1.division0Service.vendorRoster());
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async contracts(_req, res) {
        try {
            return res.json(await division0_service_1.division0Service.contractRoster());
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async activity(req, res) {
        try {
            const limit = Math.min(parseInt(req.query.limit ?? "20"), 100);
            return res.json(await division0_service_1.division0Service.recentActivity(limit));
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
};
//# sourceMappingURL=division0.controller.js.map