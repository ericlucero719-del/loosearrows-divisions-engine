// modules/crypto/crypto.controller.ts
import { Request, Response } from "express";
import { cryptoService } from "./crypto.service";

export const cryptoController = {

  async prices(req: Request, res: Response) {
    try {
      const assets = req.query.assets
        ? String(req.query.assets).split(",")
        : ["BTC", "ETH", "USDC", "SOL"];
      return res.json(await cryptoService.getLivePrices(assets));
    } catch (e: any) { return res.status(502).json({ error: e.message }); }
  },

  async summary(req: Request, res: Response) {
    try { return res.json(await cryptoService.getCryptoSummary()); }
    catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async treasury(req: Request, res: Response) {
    try { return res.json(await cryptoService.getTreasury()); }
    catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async treasuryDeposit(req: Request, res: Response) {
    try {
      const { asset, amountCrypto, source, sourceRef, txHash, notes } = req.body;
      if (!asset || !amountCrypto) return res.status(400).json({ error: "asset and amountCrypto required" });
      return res.json(await cryptoService.depositToTreasury(asset, amountCrypto, source, sourceRef, txHash, notes));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async treasuryWithdraw(req: Request, res: Response) {
    try {
      const { asset, amountCrypto, notes } = req.body;
      if (!asset || !amountCrypto) return res.status(400).json({ error: "asset and amountCrypto required" });
      return res.json(await cryptoService.withdrawFromTreasury(asset, amountCrypto, notes));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async invoicePaymentRequest(req: Request, res: Response) {
    try { return res.json(await cryptoService.getInvoicePaymentRequest(req.params.invoiceId)); }
    catch (e: any) { return res.status(404).json({ error: e.message }); }
  },

  async invoicePay(req: Request, res: Response) {
    try {
      const { asset, amountCrypto, txHash, note } = req.body;
      if (!asset || !amountCrypto) return res.status(400).json({ error: "asset and amountCrypto required" });
      return res.json(await cryptoService.recordInvoiceCryptoPayment(
        req.params.invoiceId, asset, amountCrypto, txHash, note,
      ));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async collectFee(req: Request, res: Response) {
    try {
      const { asset, feeAmountUsd, sourceRef } = req.body;
      if (!asset || !feeAmountUsd) return res.status(400).json({ error: "asset and feeAmountUsd required" });
      return res.json(await cryptoService.collectFeeInCrypto(asset, feeAmountUsd, sourceRef));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async commercePay(req: Request, res: Response) {
    try {
      const { asset, amountCrypto, txHash } = req.body;
      if (!asset || !amountCrypto) return res.status(400).json({ error: "asset and amountCrypto required" });
      return res.json(await cryptoService.recordCommerceCryptoPayment(
        req.params.ref, asset, amountCrypto, txHash,
      ));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },
};
