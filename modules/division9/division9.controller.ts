// modules/division9/division9.controller.ts

import { Request, Response } from "express";
import { division9Service } from "./division9.service";

export const division9Controller = {
  createQuote(req: Request, res: Response) {
    const { lineItems, contractId, requestId } = req.body;
    const hasItems = Array.isArray(lineItems) && lineItems.length > 0;
    if (!hasItems && !contractId) {
      return res.status(400).json({ error: "lineItems or contractId is required" });
    }
    const result = division9Service.createQuote({ requestId, contractId, lineItems });
    if ("error" in result) return res.status(400).json(result);
    return res.status(201).json(result);
  },

  listQuotes(_req: Request, res: Response) {
    return res.json(division9Service.listQuotes());
  },

  getQuote(req: Request, res: Response) {
    const quote = division9Service.getQuote(req.params.id);
    if (!quote) return res.status(404).json({ error: "Quote not found" });
    return res.json(quote);
  },

  updateQuoteStatus(req: Request, res: Response) {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "status is required" });
    const quote = division9Service.updateQuoteStatus(req.params.id, status);
    if (!quote) return res.status(404).json({ error: "Quote not found" });
    return res.json(quote);
  },

  createInvoice(req: Request, res: Response) {
    const { quoteId } = req.body;
    if (!quoteId) return res.status(400).json({ error: "quoteId is required" });
    const invoice = division9Service.createInvoice(quoteId);
    if (!invoice) return res.status(404).json({ error: "Quote not found" });
    return res.status(201).json(invoice);
  },

  listInvoices(_req: Request, res: Response) {
    return res.json(division9Service.listInvoices());
  },

  getInvoice(req: Request, res: Response) {
    const invoice = division9Service.getInvoice(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    return res.json(invoice);
  },

  recordPayment(req: Request, res: Response) {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: "amount is required" });
    const invoice = division9Service.recordPayment(req.params.id, amount);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    return res.json(invoice);
  },
};
