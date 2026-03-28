"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchRoutes = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/ping', (_req, res) => {
    res.json({ status: 'Dispatch online' });
});
router.post('/dispatch', (req, res) => {
    const { orderId, destination } = req.body;
    if (!orderId || !destination) {
        return res.status(400).json({ error: 'orderId and destination are required' });
    }
    return res.json({
        dispatched: true,
        orderId,
        destination,
        timestamp: new Date().toISOString(),
    });
});
exports.dispatchRoutes = router;
//# sourceMappingURL=index.js.map