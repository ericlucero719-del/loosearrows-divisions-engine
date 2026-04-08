"use strict";
// modules/division8/division8.controller.ts
// Division 8 — Agency & Customer Management
Object.defineProperty(exports, "__esModule", { value: true });
exports.division8Controller = void 0;
const division8_service_1 = require("./division8.service");
exports.division8Controller = {
    async listAgencies(req, res) {
        try {
            const { status } = req.query;
            return res.json(await division8_service_1.division8Service.listAgencies(status));
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async getAgency(req, res) {
        try {
            const a = await division8_service_1.division8Service.getAgency(req.params.agencyId);
            if (!a)
                return res.status(404).json({ error: "Agency not found" });
            return res.json(a);
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async createAgency(req, res) {
        try {
            const { name } = req.body;
            if (!name)
                return res.status(400).json({ error: "name is required" });
            return res.status(201).json(await division8_service_1.division8Service.createAgency(req.body));
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async updateAgency(req, res) {
        try {
            return res.json(await division8_service_1.division8Service.updateAgency(req.params.agencyId, req.body));
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async addContact(req, res) {
        try {
            const { name } = req.body;
            if (!name)
                return res.status(400).json({ error: "name is required" });
            return res.status(201).json(await division8_service_1.division8Service.addContact(req.params.agencyId, req.body));
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async deleteContact(req, res) {
        try {
            await division8_service_1.division8Service.deleteContact(req.params.contactId);
            return res.json({ deleted: req.params.contactId });
        }
        catch (e) {
            return res.status(404).json({ error: e.message });
        }
    },
    async addInteraction(req, res) {
        try {
            const { type, summary } = req.body;
            if (!type || !summary)
                return res.status(400).json({ error: "type and summary are required" });
            return res.status(201).json(await division8_service_1.division8Service.addInteraction(req.params.agencyId, req.body));
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async agencySummary(_req, res) {
        try {
            return res.json(await division8_service_1.division8Service.agencySummary());
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    meta(_req, res) {
        return res.json({
            contactRoles: division8_service_1.division8Service.contactRoles(),
            interactionTypes: division8_service_1.division8Service.interactionTypes(),
        });
    },
};
//# sourceMappingURL=division8.controller.js.map