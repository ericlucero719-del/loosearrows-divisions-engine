"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const operatorDashboard_1 = require("../division2/dashboard/operatorDashboard");
const router = express_1.default.Router();
const dashboard = new operatorDashboard_1.OperatorDashboard();
router.get("/orders", (req, res) => {
    const view = dashboard.getOrdersView();
    res.json(view);
});
router.get("/po", (req, res) => {
    const view = dashboard.getPoView();
    res.json(view);
});
router.get("/tracking", (req, res) => {
    const view = dashboard.getTrackingView();
    res.json(view);
});
router.get("/performance", (req, res) => {
    const view = dashboard.getPerformanceView();
    res.json(view);
});
router.get("/errors", (req, res) => {
    const view = dashboard.getErrorView();
    res.json(view);
});
router.get("/automation-log", (req, res) => {
    const view = dashboard.getAutomationLogView();
    res.json(view);
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map