"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const healthCheck = (_req, res) => {
    return res.status(200).json({
        status: 'ok',
        service: 'LooseArrows Engine',
        timestamp: new Date().toISOString(),
    });
};
exports.healthCheck = healthCheck;
//# sourceMappingURL=health.controller.js.map