"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const health_controller_1 = require("./health.controller");
const router = (0, express_1.Router)();
router.get('/', health_controller_1.healthCheck);
exports.healthRouter = router;
//# sourceMappingURL=health.route.js.map