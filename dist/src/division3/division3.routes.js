"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const division3_controller_1 = require("./division3.controller");
const router = (0, express_1.Router)();
router.post('/division3/process', (req, res) => {
    division3_controller_1.division3Controller.handle(req, res);
});
exports.default = router;
//# sourceMappingURL=division3.routes.js.map