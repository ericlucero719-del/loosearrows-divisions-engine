// modules/crypto/crypto.routes.ts
// LooseArrows Supply & Logistics™ — Bitcoin & Crypto Profit Engine
//
// ── Core ──────────────────────────────────────────────────────────────────────
// GET    /api/crypto/price                       — live BTC/ETH/USDC/SOL prices
// GET    /api/crypto/summary                     — full crypto profit dashboard
// GET    /api/crypto/treasury                    — holdings, cost basis, P&L
// POST   /api/crypto/treasury/deposit            — deposit BTC/USDC
// POST   /api/crypto/treasury/withdraw           — withdraw from treasury
// GET    /api/crypto/invoice/:id/payment         — crypto payment request for invoice
// POST   /api/crypto/invoice/:id/pay             — mark invoice paid in crypto
// POST   /api/crypto/fee/collect                 — collect fee revenue in USDC
// POST   /api/crypto/commerce/:ref/pay           — record BTC commerce payment
//
// ── Lightning Network ─────────────────────────────────────────────────────────
// POST   /api/crypto/lightning                   — create Lightning invoice { amountUsd }
// GET    /api/crypto/lightning                   — list Lightning invoices
// GET    /api/crypto/lightning/:id               — get single invoice
// POST   /api/crypto/lightning/:id/paid          — mark invoice paid
//
// ── BTC-Backed Credit Lines ───────────────────────────────────────────────────
// GET    /api/crypto/credit/summary              — portfolio summary + LTV health
// GET    /api/crypto/credit                      — list all credit lines
// POST   /api/crypto/credit                      — open new credit line { purpose, btcCollateral }
// POST   /api/crypto/credit/:id/draw             — draw funds { amountUsd }
// POST   /api/crypto/credit/:id/repay            — repay principal/interest { amountUsd, type }
//
// ── Reseller BTC Payouts ──────────────────────────────────────────────────────
// POST   /api/crypto/reseller/:resellerId/btc-payout  — pay reseller in BTC

import { Router } from "express";
import { requireApiKey } from "../../src/middleware/apiKey";
import { operatorWorkflow } from "../../src/core/engine";
import { cryptoController } from "./crypto.controller";

const router = Router();
router.use(requireApiKey);

// Core
router.get("/price",                              operatorWorkflow("CRYPTO", "PRICE"),             cryptoController.prices);
router.get("/summary",                            operatorWorkflow("CRYPTO", "SUMMARY"),           cryptoController.summary);
router.get("/treasury",                           operatorWorkflow("CRYPTO", "TREASURY"),          cryptoController.treasury);
router.post("/treasury/deposit",                  operatorWorkflow("CRYPTO", "DEPOSIT"),           cryptoController.treasuryDeposit);
router.post("/treasury/withdraw",                 operatorWorkflow("CRYPTO", "WITHDRAW"),          cryptoController.treasuryWithdraw);
router.get("/invoice/:invoiceId/payment",         operatorWorkflow("CRYPTO", "INVOICE_PAYMENT"),   cryptoController.invoicePaymentRequest);
router.post("/invoice/:invoiceId/pay",            operatorWorkflow("CRYPTO", "INVOICE_PAY"),       cryptoController.invoicePay);
router.post("/fee/collect",                       operatorWorkflow("CRYPTO", "FEE_COLLECT"),       cryptoController.collectFee);
router.post("/commerce/:ref/pay",                 operatorWorkflow("CRYPTO", "COMMERCE_PAY"),      cryptoController.commercePay);

// Lightning Network
router.post("/lightning",                         operatorWorkflow("CRYPTO", "LN_CREATE"),         cryptoController.lightningCreate);
router.get("/lightning",                          operatorWorkflow("CRYPTO", "LN_LIST"),           cryptoController.lightningList);
router.get("/lightning/:id",                      operatorWorkflow("CRYPTO", "LN_GET"),            cryptoController.lightningGet);
router.post("/lightning/:id/paid",                operatorWorkflow("CRYPTO", "LN_PAID"),           cryptoController.lightningPaid);

// BTC-Backed Credit Lines
router.get("/credit/summary",                     operatorWorkflow("CRYPTO", "CREDIT_SUMMARY"),    cryptoController.creditLineSummary);
router.get("/credit",                             operatorWorkflow("CRYPTO", "CREDIT_LIST"),       cryptoController.creditLineList);
router.post("/credit",                            operatorWorkflow("CRYPTO", "CREDIT_OPEN"),       cryptoController.creditLineOpen);
router.post("/credit/:id/draw",                   operatorWorkflow("CRYPTO", "CREDIT_DRAW"),       cryptoController.creditLineDraw);
router.post("/credit/:id/repay",                  operatorWorkflow("CRYPTO", "CREDIT_REPAY"),      cryptoController.creditLineRepay);

// Reseller BTC Payouts
router.post("/reseller/:resellerId/btc-payout",   operatorWorkflow("CRYPTO", "RSL_BTC_PAYOUT"),    cryptoController.resellerBtcPayout);

export default router;
