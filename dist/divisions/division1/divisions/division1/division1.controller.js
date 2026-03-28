"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Division1Controller = void 0;
const division1_service_1 = require("./division1.service");
exports.Division1Controller = {
    ping(_req, res) {
        res.json({ status: 'Division 1 online' });
    },
    quote(req, res) {
        try {
            const { clin, sku, quantity } = req.body;
            if (!clin || !sku || typeof quantity !== 'number') {
                return res.status(400).json({
                    error: 'clin, sku, and quantity are required',
                });
            }
            const quote = division1_service_1.Division1Service.validateAndPrice({
                clin,
                sku,
                quantity,
            });
            return res.json(quote);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },
};
//# sourceMappingURL=division1.controller.js.map