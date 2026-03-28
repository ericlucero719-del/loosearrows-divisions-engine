"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const division1_controller_1 = require("../../division1.controller");
const router = (0, express_1.Router)();
router.get('/ping', division1_controller_1.Division1Controller.ping);
router.post('/quote', division1_controller_1.Division1Controller.quote);
exports.default = router;
//# sourceMappingURL=division1.routes.js.map