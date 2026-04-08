// modules/pdf/pdf.routes.ts
// GET /api/pdf/invoice/:invoiceId       — Invoice PDF
// GET /api/pdf/po/:poId                 — Purchase Order PDF
// GET /api/pdf/bid/:bidId               — Capability Statement PDF

import { Router, Request, Response } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { generateInvoicePdf, generatePoPdf, generateCapabilityStatementPdf } from "./pdf.service";

const router = Router();

router.get(
  "/invoice/:invoiceId",
  operatorWorkflow("PDF", "INVOICE"),
  async (req: Request, res: Response) => {
    await generateInvoicePdf(req.params.invoiceId, res);
  },
);

router.get(
  "/po/:poId",
  operatorWorkflow("PDF", "PO"),
  async (req: Request, res: Response) => {
    await generatePoPdf(req.params.poId, res);
  },
);

router.get(
  "/bid/:bidId",
  operatorWorkflow("PDF", "CAPABILITY_STATEMENT"),
  async (req: Request, res: Response) => {
    await generateCapabilityStatementPdf(req.params.bidId, res);
  },
);

export default router;
