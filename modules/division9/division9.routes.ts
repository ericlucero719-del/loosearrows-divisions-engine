// modules/division9/division9.routes.ts
// Division 9 — Financials (Quotes, Invoices, Payments)
//
// Example requests:
//   POST /division/9/quotes
//     Body: { "contractId": "...", "lineItems": [{ "sku": "CF360A", "quantity": 10, "unitPrice": 130.00 }] }
//     Response: { "id": "...", "totalAmount": 1300.00, "status": "Draft", ... }
//
//   PUT /division/9/quotes/:id/status
//     Body: { "status": "Sent" }
//
//   POST /division/9/invoices
//     Body: { "quoteId": "..." }
//     Response: { "id": "...", "totalAmount": 1300.00, "status": "Unpaid", ... }
//
//   POST /division/9/invoices/:id/payment
//     Body: { "amount": 650.00 }
//     Response: { "status": "Partial", "paidAmount": 650.00, ... }

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { division9Controller } from "./division9.controller";

const router = Router();

router.post(
  "/quotes",
  operatorWorkflow("DIVISION-9", "CREATE_QUOTE"),
  division9Controller.createQuote
);

router.get(
  "/quotes",
  operatorWorkflow("DIVISION-9", "LIST_QUOTES"),
  division9Controller.listQuotes
);

router.get(
  "/quotes/:id",
  operatorWorkflow("DIVISION-9", "GET_QUOTE"),
  division9Controller.getQuote
);

router.put(
  "/quotes/:id/status",
  operatorWorkflow("DIVISION-9", "UPDATE_QUOTE_STATUS"),
  division9Controller.updateQuoteStatus
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
  "/invoices/:id",
  operatorWorkflow("DIVISION-9", "GET_INVOICE"),
  division9Controller.getInvoice
);

router.post(
  "/invoices/:id/payment",
  operatorWorkflow("DIVISION-9", "RECORD_PAYMENT"),
  division9Controller.recordPayment
);

export default router;
