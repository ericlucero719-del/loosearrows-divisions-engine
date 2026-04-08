"use strict";
// modules/division4/division4.controller.ts
// Division 4 — Purchase Orders & Inventory
Object.defineProperty(exports, "__esModule", { value: true });
exports.division4Controller = void 0;
const division4_service_1 = require("./division4.service");
exports.division4Controller = {
    async listPOs(req, res) {
        try {
            const { status } = req.query;
            const pos = await division4_service_1.division4Service.listPOs(status);
            return res.json(pos);
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async getPO(req, res) {
        try {
            const po = await division4_service_1.division4Service.getPO(req.params.poId);
            if (!po)
                return res.status(404).json({ error: "Purchase order not found" });
            return res.json(po);
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async createPO(req, res) {
        try {
            const po = await division4_service_1.division4Service.createPO(req.body);
            return res.status(201).json(po);
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async createPOFromBid(req, res) {
        try {
            const po = await division4_service_1.division4Service.createPOFromBid(req.params.bidId);
            return res.status(201).json(po);
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async updateStatus(req, res) {
        try {
            const { status, notes } = req.body;
            if (!status)
                return res.status(400).json({ error: "status is required" });
            const po = await division4_service_1.division4Service.updateStatus(req.params.poId, status, notes);
            return res.json(po);
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async inventorySummary(_req, res) {
        try {
            const summary = await division4_service_1.division4Service.inventorySummary();
            return res.json(summary);
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
};
//# sourceMappingURL=division4.controller.js.map