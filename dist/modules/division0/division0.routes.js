"use strict";
// modules/division0/division0.routes.ts
// Division 0 — System Command Center (admin-only via X-Admin-Secret)
//
// GET /division/0/status          full system status — all 11 divisions with record counts
// GET /division/0/pipeline        pipeline summary — contracts → bids → POs → shipments → invoices
// GET /division/0/financials      financial rollup — PO value, invoiced, paid, outstanding
// GET /division/0/vendors         vendor roster — all vendors with categories and status
// GET /division/0/contracts       contract roster — all contracts with status and value
// GET /division/0/activity        recent activity feed — last N events across all divisions
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const division0_controller_1 = require("./division0.controller");
const router = (0, express_1.Router)();
function adminOnly(req, res, next) {
    const secret = req.headers["x-admin-secret"];
    if (!secret || secret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ error: "Admin access required. Provide X-Admin-Secret header." });
    }
    return next();
}
router.use(adminOnly);
router.get("/status", division0_controller_1.division0Controller.fullStatus);
router.get("/pipeline", division0_controller_1.division0Controller.pipeline);
router.get("/financials", division0_controller_1.division0Controller.financials);
router.get("/vendors", division0_controller_1.division0Controller.vendors);
router.get("/contracts", division0_controller_1.division0Controller.contracts);
router.get("/activity", division0_controller_1.division0Controller.activity);
exports.default = router;
//# sourceMappingURL=division0.routes.js.map