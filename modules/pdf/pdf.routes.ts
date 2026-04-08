// modules/pdf/pdf.routes.ts
// GET /api/pdf/invoice/:invoiceId       — Invoice PDF
// GET /api/pdf/po/:poId                 — Purchase Order PDF
// GET /api/pdf/bid/:bidId               — Capability Statement PDF
// GET /api/pdf/documents                — List all downloadable documents

import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { operatorWorkflow } from "../../src/core/engine";
import { generateInvoicePdf, generatePoPdf, generateCapabilityStatementPdf } from "./pdf.service";

const prisma = new PrismaClient();

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

// GET /api/pdf/documents — list all available documents for download
router.get(
  "/documents",
  operatorWorkflow("PDF", "DOCUMENTS"),
  async (_req: Request, res: Response) => {
    try {
      const [pos, invoices, bids] = await Promise.all([
        (prisma as any).govPO.findMany({
          select: {
            poId: true, poRef: true, vendorName: true,
            agencyName: true, status: true, totalValue: true, createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        (prisma as any).govInvoice.findMany({
          select: {
            invoiceId: true, invoiceRef: true, vendorName: true,
            agencyName: true, status: true, totalAmount: true, dueDate: true, createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        (prisma as any).govBid.findMany({
          select: {
            bidId: true, bidRef: true, vendorName: true,
            status: true, totalValue: true, awardedAt: true, createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 30,
        }),
      ]);
      return res.json({ pos, invoices, bids });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },
);

export default router;
