"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.division3Controller = void 0;
const division3_service_1 = require("./division3.service");
exports.division3Controller = {
    async handle(req, res) {
        try {
            const result = await division3_service_1.division3Service.process({
                operatorId: req.body.operatorId,
                payload: req.body.payload
            });
            res.status(result.status === 'success' ? 200 : 400).json(result);
        }
        catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message || 'Unexpected server error'
            });
        }
    }
};
//# sourceMappingURL=division3.controller.js.map