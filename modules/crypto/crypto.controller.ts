// modules/crypto/crypto.controller.ts
import { Request, Response } from "express";
import { cryptoService } from "./crypto.service";

export const cryptoController = {

  async prices(req: Request, res: Response) {
    try {
      const assets = req.query.assets ? String(req.query.assets).split(",") : ["BTC", "ETH", "USDC", "SOL"];
      return res.json(await cryptoService.getLivePrices(assets));
    } catch (e: any) { return res.status(502).json({ error: e.message }); }
  },

  async summary(_req: Request, res: Response) {
    try { return res.json(await cryptoService.getCryptoSummary()); }
    catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async treasury(_req: Request, res: Response) {
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
      return res.json(await cryptoService.recordInvoiceCryptoPayment(req.params.invoiceId, asset, amountCrypto, txHash, note));
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
      return res.json(await cryptoService.recordCommerceCryptoPayment(req.params.ref, asset, amountCrypto, txHash));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  // ── Lightning ──────────────────────────────────────────────────────────────

  async lightningCreate(req: Request, res: Response) {
    try {
      const { amountUsd, description, linkedRef, linkedType, expiresInMinutes } = req.body;
      if (!amountUsd) return res.status(400).json({ error: "amountUsd required" });
      return res.status(201).json(await cryptoService.createLightningInvoice({ amountUsd, description, linkedRef, linkedType, expiresInMinutes }));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async lightningList(req: Request, res: Response) {
    try { return res.json(await cryptoService.listLightningInvoices(req.query.status as string)); }
    catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async lightningGet(req: Request, res: Response) {
    try { return res.json(await cryptoService.getLightningInvoice(req.params.id)); }
    catch (e: any) { return res.status(404).json({ error: e.message }); }
  },

  async lightningPaid(req: Request, res: Response) {
    try { return res.json(await cryptoService.markLightningPaid(req.params.id, req.body.paymentPreimage)); }
    catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  // ── Credit Lines ───────────────────────────────────────────────────────────

  async creditLineSummary(_req: Request, res: Response) {
    try { return res.json(await cryptoService.getCreditLineSummary()); }
    catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async creditLineList(req: Request, res: Response) {
    try { return res.json(await cryptoService.listCreditLines(req.query.status as string)); }
    catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async creditLineOpen(req: Request, res: Response) {
    try {
      const { purpose, btcCollateral, ltvRatio, interestRatePct, lender, linkedContractRef, notes } = req.body;
      if (!purpose || !btcCollateral) return res.status(400).json({ error: "purpose and btcCollateral required" });
      return res.status(201).json(await cryptoService.openCreditLine({ purpose, btcCollateral, ltvRatio, interestRatePct, lender, linkedContractRef, notes }));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async creditLineDraw(req: Request, res: Response) {
    try {
      const { amountUsd } = req.body;
      if (!amountUsd) return res.status(400).json({ error: "amountUsd required" });
      return res.json(await cryptoService.drawOnCreditLine(req.params.id, amountUsd));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async creditLineRepay(req: Request, res: Response) {
    try {
      const { amountUsd, type, reference } = req.body;
      if (!amountUsd) return res.status(400).json({ error: "amountUsd required" });
      return res.json(await cryptoService.repayCreditLine(req.params.id, amountUsd, type, reference));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  // ── Reseller BTC Payout ────────────────────────────────────────────────────

  async resellerBtcPayout(req: Request, res: Response) {
    try {
      const { btcWalletAddress, notes } = req.body;
      if (!btcWalletAddress) return res.status(400).json({ error: "btcWalletAddress required" });
      return res.json(await cryptoService.resellerBtcPayout(req.params.resellerId, btcWalletAddress, notes));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },
};
