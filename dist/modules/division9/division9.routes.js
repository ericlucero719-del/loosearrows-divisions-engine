"use strict";
// modules/division9/division9.routes.ts
// Division 9 — Financials & Invoicing
//
// POST   /division/9/invoices                         Create invoice manually
// POST   /division/9/invoices/from-bid/:bidId         Auto-create invoice from awarded bid
// POST   /division/9/invoices/from-po/:poId           Auto-create invoice from PO
// GET    /division/9/invoices                         List all (?status=SENT)
// GET    /division/9/invoices/:invoiceId              Get single
// PATCH  /division/9/invoices/:invoiceId/status       Update status
// POST   /division/9/invoices/:invoiceId/payment      Record payment
// GET    /division/9/summary                          Financial summary
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const engine_1 = require("../../src/core/engine");
const division9_controller_1 = require("./division9.controller");
const router = (0, express_1.Router)();
router.post("/invoices/from-bid/:bidId", (0, engine_1.operatorWorkflow)("DIVISION-9", "CREATE_INVOICE_FROM_BID"), division9_controller_1.division9Controller.createInvoiceFromBid);
router.post("/invoices/from-po/:poId", (0, engine_1.operatorWorkflow)("DIVISION-9", "CREATE_INVOICE_FROM_PO"), division9_controller_1.division9Controller.createInvoiceFromPO);
router.post("/invoices", (0, engine_1.operatorWorkflow)("DIVISION-9", "CREATE_INVOICE"), division9_controller_1.division9Controller.createInvoice);
router.get("/invoices", (0, engine_1.operatorWorkflow)("DIVISION-9", "LIST_INVOICES"), division9_controller_1.division9Controller.listInvoices);
router.get("/invoices/:invoiceId", (0, engine_1.operatorWorkflow)("DIVISION-9", "GET_INVOICE"), division9_controller_1.division9Controller.getInvoice);
router.patch("/invoices/:invoiceId/status", (0, engine_1.operatorWorkflow)("DIVISION-9", "UPDATE_INVOICE_STATUS"), division9_controller_1.division9Controller.updateStatus);
router.post("/invoices/:invoiceId/payment", (0, engine_1.operatorWorkflow)("DIVISION-9", "RECORD_PAYMENT"), division9_controller_1.division9Controller.recordPayment);
router.get("/summary", (0, engine_1.operatorWorkflow)("DIVISION-9", "FINANCIAL_SUMMARY"), division9_controller_1.division9Controller.financialSummary);
exports.default = router;
//# sourceMappingURL=division9.routes.js.map