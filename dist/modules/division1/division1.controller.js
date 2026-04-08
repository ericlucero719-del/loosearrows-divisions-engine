"use strict";
// modules/division1/division1.controller.ts
// Division 1 — Product Catalog & Pricing
Object.defineProperty(exports, "__esModule", { value: true });
exports.division1Controller = void 0;
const division1_service_1 = require("./division1.service");
exports.division1Controller = {
    async listProducts(req, res) {
        try {
            const { category, status } = req.query;
            return res.json(await division1_service_1.division1Service.listProducts(category, status));
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async getProduct(req, res) {
        try {
            const p = await division1_service_1.division1Service.getProduct(req.params.sku);
            if (!p)
                return res.status(404).json({ error: "Product not found" });
            return res.json(p);
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async createProduct(req, res) {
        try {
            const { sku, name, cost } = req.body;
            if (!sku || !name || cost == null)
                return res.status(400).json({ error: "sku, name, and cost are required" });
            return res.status(201).json(await division1_service_1.division1Service.createProduct(req.body));
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async updateProduct(req, res) {
        try {
            const p = await division1_service_1.division1Service.updateProduct(req.params.sku, req.body);
            return res.json(p);
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async deleteProduct(req, res) {
        try {
            await division1_service_1.division1Service.deleteProduct(req.params.sku);
            return res.json({ deleted: req.params.sku });
        }
        catch (e) {
            return res.status(404).json({ error: e.message });
        }
    },
    async priceCalc(req, res) {
        try {
            return res.json(await division1_service_1.division1Service.priceCalc(req.params.sku));
        }
        catch (e) {
            return res.status(404).json({ error: e.message });
        }
    },
    async bulkImport(req, res) {
        try {
            const products = Array.isArray(req.body) ? req.body : req.body?.products;
            if (!Array.isArray(products))
                return res.status(400).json({ error: "Body must be an array or { products: [...] }" });
            return res.json(await division1_service_1.division1Service.bulkImport(products));
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async catalogSummary(_req, res) {
        try {
            return res.json(await division1_service_1.division1Service.catalogSummary());
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
};
//# sourceMappingURL=division1.controller.js.map