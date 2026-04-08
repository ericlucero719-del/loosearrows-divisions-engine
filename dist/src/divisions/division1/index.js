"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.division1Routes = void 0;
const express_1 = require("express");
const division1_controller_1 = require("./divisions/division1/division1.controller");
const router = (0, express_1.Router)();
router.get('/ping', division1_controller_1.Division1Controller.ping);
router.post('/quote', division1_controller_1.Division1Controller.quote);
exports.division1Routes = router;
//# sourceMappingURL=index.js.map