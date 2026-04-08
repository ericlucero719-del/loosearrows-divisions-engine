"use strict";
// modules/division6/division6.controller.ts
// Division 6 — Compliance & Documentation
Object.defineProperty(exports, "__esModule", { value: true });
exports.division6Controller = void 0;
const division6_service_1 = require("./division6.service");
exports.division6Controller = {
    docTypes(_req, res) {
        return res.json(division6_service_1.division6Service.docTypes());
    },
    async listDocs(req, res) {
        try {
            const { docType, status } = req.query;
            return res.json(await division6_service_1.division6Service.listDocs(docType, status));
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async getDoc(req, res) {
        try {
            const doc = await division6_service_1.division6Service.getDoc(req.params.docId);
            if (!doc)
                return res.status(404).json({ error: "Document not found" });
            return res.json(doc);
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async createDoc(req, res) {
        try {
            const { docType, title } = req.body;
            if (!docType || !title)
                return res.status(400).json({ error: "docType and title are required" });
            return res.status(201).json(await division6_service_1.division6Service.createDoc(req.body));
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async updateDoc(req, res) {
        try {
            return res.json(await division6_service_1.division6Service.updateDoc(req.params.docId, req.body));
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async deleteDoc(req, res) {
        try {
            await division6_service_1.division6Service.deleteDoc(req.params.docId);
            return res.json({ deleted: req.params.docId });
        }
        catch (e) {
            return res.status(404).json({ error: e.message });
        }
    },
    async complianceStatus(_req, res) {
        try {
            return res.json(await division6_service_1.division6Service.complianceStatus());
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async generateCapabilityStatement(req, res) {
        try {
            const { companyName } = req.body;
            if (!companyName)
                return res.status(400).json({ error: "companyName is required" });
            return res.json(await division6_service_1.division6Service.generateCapabilityStatement(req.body));
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
};
//# sourceMappingURL=division6.controller.js.map