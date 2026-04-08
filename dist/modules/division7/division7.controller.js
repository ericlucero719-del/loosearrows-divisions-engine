"use strict";
// modules/division7/division7.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.division7Controller = void 0;
const division7_service_1 = require("./division7.service");
exports.division7Controller = {
    async createVendor(req, res) {
        const name = req.body.name ?? req.body.vendorName;
        if (!name)
            return res.status(400).json({ error: "name (or vendorName) is required" });
        const vendor = await division7_service_1.division7Service.createVendor({
            name,
            categories: req.body.categories ?? [],
            capabilities: req.body.capabilities ?? [],
            performanceNotes: req.body.performanceNotes,
            contactEmail: req.body.contactEmail,
            status: req.body.status ?? "pending",
        });
        return res.status(201).json(vendor);
    },
    async listVendors(_req, res) {
        return res.json(await division7_service_1.division7Service.listVendors());
    },
    async getVendor(req, res) {
        const vendor = await division7_service_1.division7Service.getVendor(req.params.id);
        if (!vendor)
            return res.status(404).json({ error: "Vendor not found" });
        return res.json(vendor);
    },
    async updateVendor(req, res) {
        const vendor = await division7_service_1.division7Service.updateVendor(req.params.id, req.body);
        if (!vendor)
            return res.status(404).json({ error: "Vendor not found" });
        return res.json(vendor);
    },
    async attachVendor(req, res) {
        const { type, referenceId } = req.body;
        if (!type || !referenceId) {
            return res.status(400).json({ error: "type and referenceId are required" });
        }
        const vendor = await division7_service_1.division7Service.attach(req.params.id, type, referenceId);
        if (!vendor)
            return res.status(404).json({ error: "Vendor not found" });
        return res.json(vendor);
    },
};
//# sourceMappingURL=division7.controller.js.map