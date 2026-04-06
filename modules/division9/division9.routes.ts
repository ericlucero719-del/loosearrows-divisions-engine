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

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { division9Controller } from "./division9.controller";

const router = Router();

router.post(
  "/invoices/from-bid/:bidId",
  operatorWorkflow("DIVISION-9", "CREATE_INVOICE_FROM_BID"),
  division9Controller.createInvoiceFromBid
);

router.post(
  "/invoices/from-po/:poId",
  operatorWorkflow("DIVISION-9", "CREATE_INVOICE_FROM_PO"),
  division9Controller.createInvoiceFromPO
);

router.post(
  "/invoices",
  operatorWorkflow("DIVISION-9", "CREATE_INVOICE"),
  division9Controller.createInvoice
);

router.get(
  "/invoices",
  operatorWorkflow("DIVISION-9", "LIST_INVOICES"),
  division9Controller.listInvoices
);

router.get(
  "/invoices/:invoiceId",
  operatorWorkflow("DIVISION-9", "GET_INVOICE"),
  division9Controller.getInvoice
);

router.patch(
  "/invoices/:invoiceId/status",
  operatorWorkflow("DIVISION-9", "UPDATE_INVOICE_STATUS"),
  division9Controller.updateStatus
);

router.post(
  "/invoices/:invoiceId/payment",
  operatorWorkflow("DIVISION-9", "RECORD_PAYMENT"),
  division9Controller.recordPayment
);

router.get(
  "/summary",
  operatorWorkflow("DIVISION-9", "FINANCIAL_SUMMARY"),
  division9Controller.financialSummary
);

export default router;
