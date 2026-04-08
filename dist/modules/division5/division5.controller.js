"use strict";
// modules/division5/division5.controller.ts
// Division 5 — Shipments & Fulfillment
Object.defineProperty(exports, "__esModule", { value: true });
exports.division5Controller = void 0;
const division5_service_1 = require("./division5.service");
exports.division5Controller = {
    async listShipments(req, res) {
        try {
            const { status } = req.query;
            return res.json(await division5_service_1.division5Service.listShipments(status));
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async getShipment(req, res) {
        try {
            const s = await division5_service_1.division5Service.getShipment(req.params.shipmentId);
            if (!s)
                return res.status(404).json({ error: "Shipment not found" });
            return res.json(s);
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async createShipment(req, res) {
        try {
            const s = await division5_service_1.division5Service.createShipment(req.body);
            return res.status(201).json(s);
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async createShipmentFromPO(req, res) {
        try {
            const s = await division5_service_1.division5Service.createShipmentFromPO(req.params.poId);
            return res.status(201).json(s);
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
            const s = await division5_service_1.division5Service.updateStatus(req.params.shipmentId, status.toUpperCase().replace(/ /g, "_"), notes);
            return res.json(s);
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async updateTracking(req, res) {
        try {
            const s = await division5_service_1.division5Service.updateTracking(req.params.shipmentId, req.body);
            return res.json(s);
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async markDelivered(req, res) {
        try {
            const s = await division5_service_1.division5Service.markDelivered(req.params.shipmentId);
            return res.json(s);
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async listOverdue(_req, res) {
        try {
            return res.json(await division5_service_1.division5Service.listOverdue());
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async fulfillmentSummary(_req, res) {
        try {
            return res.json(await division5_service_1.division5Service.fulfillmentSummary());
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
};
//# sourceMappingURL=division5.controller.js.map