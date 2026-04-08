"use strict";
// modules/tiktok/tiktok.controller.ts
// LooseArrows Supply & Logistics™ — TikTok Sales Automation Layer
Object.defineProperty(exports, "__esModule", { value: true });
exports.tikTokController = void 0;
const tiktok_service_1 = require("./tiktok.service");
exports.tikTokController = {
    // POST /tiktok/order — capture order, run SKU match, profit calc, create PO
    async captureOrder(req, res) {
        try {
            const { order_id, items } = req.body;
            if (!order_id || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: "order_id and items[] are required" });
            }
            const result = await tiktok_service_1.tikTokService.captureOrder(req.body);
            return res.status(201).json(result);
        }
        catch (e) {
            if (e.code === "P2002")
                return res.status(409).json({ error: `Order ${req.body.order_id} already exists` });
            return res.status(400).json({ error: e.message });
        }
    },
    // POST /tiktok/fulfill — trigger home or supplier fulfillment
    async fulfill(req, res) {
        try {
            const { order_id, method, carrier, trackingRef } = req.body;
            if (!order_id || !method)
                return res.status(400).json({ error: "order_id and method (home|supplier) are required" });
            if (!["home", "supplier"].includes(method))
                return res.status(400).json({ error: "method must be 'home' or 'supplier'" });
            return res.json(await tiktok_service_1.tikTokService.fulfill(order_id, method, carrier, trackingRef));
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    // POST /tiktok/invoice — generate invoice from order
    async invoice(req, res) {
        try {
            const { order_id } = req.body;
            if (!order_id)
                return res.status(400).json({ error: "order_id is required" });
            return res.json(await tiktok_service_1.tikTokService.invoice(order_id));
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    // POST /tiktok/payment — sync payment on invoice
    async payment(req, res) {
        try {
            const { order_id } = req.body;
            if (!order_id)
                return res.status(400).json({ error: "order_id is required" });
            return res.json(await tiktok_service_1.tikTokService.recordPayment(order_id));
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    // POST /tiktok/notify — log event + update inventory
    async notify(req, res) {
        try {
            const { order_id, event } = req.body;
            if (!order_id || !event)
                return res.status(400).json({ error: "order_id and event are required" });
            return res.json(await tiktok_service_1.tikTokService.notify(order_id, event));
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    // GET /tiktok/orders — list all orders (filter ?status=)
    async listOrders(req, res) {
        try {
            const { status } = req.query;
            return res.json(await tiktok_service_1.tikTokService.listOrders(status));
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    // GET /tiktok/orders/:order_id — get single order with full detail
    async getOrder(req, res) {
        try {
            return res.json(await tiktok_service_1.tikTokService.getOrder(req.params.order_id));
        }
        catch (e) {
            return res.status(404).json({ error: e.message });
        }
    },
    // GET /tiktok/summary — aggregate stats
    async summary(_req, res) {
        try {
            return res.json(await tiktok_service_1.tikTokService.summary());
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
};
//# sourceMappingURL=tiktok.controller.js.map