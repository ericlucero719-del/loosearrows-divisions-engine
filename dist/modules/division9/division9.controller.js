"use strict";
// modules/division9/division9.controller.ts
// Division 9 — Financials & Invoicing
Object.defineProperty(exports, "__esModule", { value: true });
exports.division9Controller = void 0;
const division9_service_1 = require("./division9.service");
exports.division9Controller = {
    async listInvoices(req, res) {
        try {
            const { status } = req.query;
            return res.json(await division9_service_1.division9Service.listInvoices(status));
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async getInvoice(req, res) {
        try {
            const inv = await division9_service_1.division9Service.getInvoice(req.params.invoiceId);
            if (!inv)
                return res.status(404).json({ error: "Invoice not found" });
            return res.json(inv);
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async createInvoice(req, res) {
        try {
            const inv = await division9_service_1.division9Service.createInvoice(req.body);
            return res.status(201).json(inv);
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async createInvoiceFromBid(req, res) {
        try {
            const { dueDate } = req.body;
            const inv = await division9_service_1.division9Service.createInvoiceFromBid(req.params.bidId, dueDate);
            return res.status(201).json(inv);
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async createInvoiceFromPO(req, res) {
        try {
            const { dueDate } = req.body;
            const inv = await division9_service_1.division9Service.createInvoiceFromPO(req.params.poId, dueDate);
            return res.status(201).json(inv);
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
            const inv = await division9_service_1.division9Service.updateStatus(req.params.invoiceId, status.toUpperCase(), notes);
            return res.json(inv);
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async recordPayment(req, res) {
        try {
            const { amount } = req.body;
            if (!amount || isNaN(Number(amount)))
                return res.status(400).json({ error: "amount (numeric) is required" });
            const inv = await division9_service_1.division9Service.recordPayment(req.params.invoiceId, Number(amount));
            return res.json(inv);
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async financialSummary(_req, res) {
        try {
            return res.json(await division9_service_1.division9Service.financialSummary());
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
};
//# sourceMappingURL=division9.controller.js.map