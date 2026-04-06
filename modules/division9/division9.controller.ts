// modules/division9/division9.controller.ts
// Division 9 — Financials & Invoicing

import { Request, Response } from "express";
import { division9Service } from "./division9.service";

export const division9Controller = {

  async listInvoices(req: Request, res: Response) {
    try {
      const { status } = req.query as Record<string, string | undefined>;
      return res.json(await division9Service.listInvoices(status));
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },

  async getInvoice(req: Request, res: Response) {
    try {
      const inv = await division9Service.getInvoice(req.params.invoiceId);
      if (!inv) return res.status(404).json({ error: "Invoice not found" });
      return res.json(inv);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },

  async createInvoice(req: Request, res: Response) {
    try {
      const inv = await division9Service.createInvoice(req.body);
      return res.status(201).json(inv);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },

  async createInvoiceFromBid(req: Request, res: Response) {
    try {
      const { dueDate } = req.body;
      const inv = await division9Service.createInvoiceFromBid(req.params.bidId, dueDate);
      return res.status(201).json(inv);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  async createInvoiceFromPO(req: Request, res: Response) {
    try {
      const { dueDate } = req.body;
      const inv = await division9Service.createInvoiceFromPO(req.params.poId, dueDate);
      return res.status(201).json(inv);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { status, notes } = req.body;
      if (!status) return res.status(400).json({ error: "status is required" });
      const inv = await division9Service.updateStatus(req.params.invoiceId, status.toUpperCase(), notes);
      return res.json(inv);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  async recordPayment(req: Request, res: Response) {
    try {
      const { amount } = req.body;
      if (!amount || isNaN(Number(amount))) return res.status(400).json({ error: "amount (numeric) is required" });
      const inv = await division9Service.recordPayment(req.params.invoiceId, Number(amount));
      return res.json(inv);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  async financialSummary(_req: Request, res: Response) {
    try {
      return res.json(await division9Service.financialSummary());
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },
};
