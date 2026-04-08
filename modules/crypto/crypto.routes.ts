// modules/crypto/crypto.routes.ts
// LooseArrows Supply & Logistics™ — Bitcoin & Crypto Profit Engine
//
// GET    /api/crypto/price                    — live BTC/ETH/USDC/SOL prices (?assets=BTC,ETH)
// GET    /api/crypto/summary                  — full crypto profit dashboard
// GET    /api/crypto/treasury                 — holdings, cost basis, unrealized P&L
// POST   /api/crypto/treasury/deposit         — record BTC/USDC deposit { asset, amountCrypto, ... }
// POST   /api/crypto/treasury/withdraw        — record withdrawal { asset, amountCrypto }
// GET    /api/crypto/invoice/:invoiceId/payment — crypto payment request for invoice
// POST   /api/crypto/invoice/:invoiceId/pay   — mark invoice paid in crypto { asset, amountCrypto, txHash }
// POST   /api/crypto/fee/collect              — collect platform fee as USDC { asset, feeAmountUsd }
// POST   /api/crypto/commerce/:ref/pay        — record BTC payment on commerce order { asset, amountCrypto }

import { Router } from "express";
import { requireApiKey } from "../../src/middleware/apiKey";
import { operatorWorkflow } from "../../src/core/engine";
import { cryptoController } from "./crypto.controller";

const router = Router();
router.use(requireApiKey);

router.get("/price",                              operatorWorkflow("CRYPTO", "PRICE"),             cryptoController.prices);
router.get("/summary",                            operatorWorkflow("CRYPTO", "SUMMARY"),           cryptoController.summary);
router.get("/treasury",                           operatorWorkflow("CRYPTO", "TREASURY"),          cryptoController.treasury);
router.post("/treasury/deposit",                  operatorWorkflow("CRYPTO", "DEPOSIT"),           cryptoController.treasuryDeposit);
router.post("/treasury/withdraw",                 operatorWorkflow("CRYPTO", "WITHDRAW"),          cryptoController.treasuryWithdraw);
router.get("/invoice/:invoiceId/payment",         operatorWorkflow("CRYPTO", "INVOICE_PAYMENT"),  cryptoController.invoicePaymentRequest);
router.post("/invoice/:invoiceId/pay",            operatorWorkflow("CRYPTO", "INVOICE_PAY"),      cryptoController.invoicePay);
router.post("/fee/collect",                       operatorWorkflow("CRYPTO", "FEE_COLLECT"),      cryptoController.collectFee);
router.post("/commerce/:ref/pay",                 operatorWorkflow("CRYPTO", "COMMERCE_PAY"),     cryptoController.commercePay);

export default router;
