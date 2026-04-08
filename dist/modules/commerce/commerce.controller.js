"use strict";
// modules/commerce/commerce.controller.ts
// LooseArrows Supply & Logistics™
// Shared controller factory — one set of handlers, all platforms
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCommerceController = makeCommerceController;
function makeCommerceController(svc) {
    return {
        async captureOrder(req, res) {
            try {
                const { order_id, items } = req.body;
                if (!order_id || !Array.isArray(items) || items.length === 0) {
                    return res.status(400).json({ error: "order_id and items[] are required" });
                }
                return res.status(201).json(await svc.captureOrder(req.body));
            }
            catch (e) {
                if (e.code === "P2002")
                    return res.status(409).json({ error: `Order ${req.body.order_id} already exists on this platform` });
                return res.status(400).json({ error: e.message });
            }
        },
        async fulfill(req, res) {
            try {
                const { order_id, method, carrier, trackingRef } = req.body;
                if (!order_id || !method)
                    return res.status(400).json({ error: "order_id and method (home|supplier) are required" });
                if (!["home", "supplier"].includes(method))
                    return res.status(400).json({ error: "method must be 'home' or 'supplier'" });
                return res.json(await svc.fulfill(order_id, method, carrier, trackingRef));
            }
            catch (e) {
                return res.status(400).json({ error: e.message });
            }
        },
        async invoice(req, res) {
            try {
                const { order_id } = req.body;
                if (!order_id)
                    return res.status(400).json({ error: "order_id is required" });
                return res.json(await svc.invoice(order_id));
            }
            catch (e) {
                return res.status(400).json({ error: e.message });
            }
        },
        async payment(req, res) {
            try {
                const { order_id } = req.body;
                if (!order_id)
                    return res.status(400).json({ error: "order_id is required" });
                return res.json(await svc.recordPayment(order_id));
            }
            catch (e) {
                return res.status(400).json({ error: e.message });
            }
        },
        async notify(req, res) {
            try {
                const { order_id, event } = req.body;
                if (!order_id || !event)
                    return res.status(400).json({ error: "order_id and event are required" });
                return res.json(await svc.notify(order_id, event));
            }
            catch (e) {
                return res.status(400).json({ error: e.message });
            }
        },
        async listOrders(req, res) {
            try {
                return res.json(await svc.listOrders(req.query.status));
            }
            catch (e) {
                return res.status(500).json({ error: e.message });
            }
        },
        async getOrder(req, res) {
            try {
                return res.json(await svc.getOrder(req.params.order_id));
            }
            catch (e) {
                return res.status(404).json({ error: e.message });
            }
        },
        async summary(_req, res) {
            try {
                return res.json(await svc.summary());
            }
            catch (e) {
                return res.status(500).json({ error: e.message });
            }
        },
    };
}
//# sourceMappingURL=commerce.controller.js.map