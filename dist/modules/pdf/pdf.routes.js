"use strict";
// modules/pdf/pdf.routes.ts
// GET /api/pdf/invoice/:invoiceId       — Invoice PDF
// GET /api/pdf/po/:poId                 — Purchase Order PDF
// GET /api/pdf/bid/:bidId               — Capability Statement PDF
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const engine_1 = require("../../src/core/engine");
const pdf_service_1 = require("./pdf.service");
const router = (0, express_1.Router)();
router.get("/invoice/:invoiceId", (0, engine_1.operatorWorkflow)("PDF", "INVOICE"), async (req, res) => {
    await (0, pdf_service_1.generateInvoicePdf)(req.params.invoiceId, res);
});
router.get("/po/:poId", (0, engine_1.operatorWorkflow)("PDF", "PO"), async (req, res) => {
    await (0, pdf_service_1.generatePoPdf)(req.params.poId, res);
});
router.get("/bid/:bidId", (0, engine_1.operatorWorkflow)("PDF", "CAPABILITY_STATEMENT"), async (req, res) => {
    await (0, pdf_service_1.generateCapabilityStatementPdf)(req.params.bidId, res);
});
exports.default = router;
//# sourceMappingURL=pdf.routes.js.map