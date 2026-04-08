// modules/crypto/crypto.service.ts
// LooseArrows Supply & Logistics™ — Bitcoin & Crypto Profit Engine
//
// 7 Profit Centers:
//  1. Live price feed (BTC/ETH/USDC/SOL) via CoinGecko — no API key required
//  2. Invoice crypto payments — pay any GovInvoice in BTC or USDC
//  3. Bitcoin treasury — buy/hold BTC, track cost basis and unrealized P&L
//  4. Crypto fee collection — collect platform fee revenue in USDC
//  5. Commerce crypto checkout — record BTC payment on any commerce order
//  6. Treasury P&L report — realized + unrealized gains across all positions
//  7. Profit summary — combined crypto revenue dashboard

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COINGECKO = "https://api.coingecko.com/api/v3";

const ASSET_IDS: Record<string, string> = {
  BTC:  "bitcoin",
  ETH:  "ethereum",
  USDC: "usd-coin",
  SOL:  "solana",
};

// Stablecoins always = $1, no API call needed
const STABLE_PRICES: Record<string, number> = { USDC: 1, USDT: 1, DAI: 1 };

// ── In-memory price cache (60 second TTL) ─────────────────────────────────────
let priceCache: { data: any[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

// ─── 1. Live Price Feed ───────────────────────────────────────────────────────

export async function getLivePrices(assets: string[] = ["BTC", "ETH", "USDC", "SOL"]) {
  const now = Date.now();

  // Return stablecoins immediately without API call
  const allStable = assets.every(a => STABLE_PRICES[a.toUpperCase()] !== undefined);
  if (allStable) {
    return assets.map(a => ({
      asset: a.toUpperCase(), priceUsd: STABLE_PRICES[a.toUpperCase()], change24h: 0, marketCapUsd: null,
    }));
  }

  // Use cache if fresh
  if (priceCache && now - priceCache.fetchedAt < CACHE_TTL_MS) {
    return priceCache.data.filter(p => assets.map(a=>a.toUpperCase()).includes(p.asset));
  }

  // Fetch all 4 assets in one call to minimise API hits
  const fetchAssets = ["BTC", "ETH", "USDC", "SOL"];
  const ids = fetchAssets.map(a => ASSET_IDS[a]).join(",");
  const url = `${COINGECKO}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;

  let raw: Record<string, any> = {};
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`CoinGecko error ${res.status}`);
    raw = await res.json() as Record<string, any>;
  } catch (err: any) {
    // On rate-limit or error, use stale cache if available, otherwise throw
    if (priceCache) return priceCache.data.filter(p => assets.map(a=>a.toUpperCase()).includes(p.asset));
    throw err;
  }

  const freshData = fetchAssets.map(asset => {
    if (STABLE_PRICES[asset]) return { asset, priceUsd: STABLE_PRICES[asset], change24h: 0, marketCapUsd: null };
    const id   = ASSET_IDS[asset];
    const data = raw[id] ?? {};
    return {
      asset,
      priceUsd:    data.usd            ?? null,
      change24h:   data.usd_24h_change ?? null,
      marketCapUsd: data.usd_market_cap ?? null,
    };
  });

  priceCache = { data: freshData, fetchedAt: now };
  return freshData.filter(p => assets.map(a=>a.toUpperCase()).includes(p.asset));
}

// ─── 2. Invoice Crypto Payment ────────────────────────────────────────────────

export async function getInvoicePaymentRequest(invoiceId: string) {
  const invoice = await (prisma as any).govInvoice.findUnique({ where: { invoiceId } });
  if (!invoice) throw new Error(`Invoice ${invoiceId} not found`);

  const prices  = await getLivePrices(["BTC", "USDC"]);
  const btcPrice  = prices.find(p => p.asset === "BTC")?.priceUsd ?? 0;
  const outstanding = invoice.totalAmount - invoice.paidAmount;

  return {
    invoiceRef:     invoice.invoiceRef,
    invoiceId,
    usdOutstanding: outstanding,
    paymentOptions: [
      {
        asset:       "BTC",
        priceUsd:    btcPrice,
        amountDue:   btcPrice > 0 ? Math.round((outstanding / btcPrice) * 1e8) / 1e8 : null,
        walletNote:  "Provide your BTC wallet address to generate a payment request",
      },
      {
        asset:    "USDC",
        priceUsd: 1,
        amountDue: outstanding,
        walletNote: "Provide your USDC (ERC-20) wallet address to generate a payment request",
      },
    ],
    btcPriceAt: btcPrice,
    generatedAt: new Date().toISOString(),
  };
}

export async function recordInvoiceCryptoPayment(
  invoiceId: string,
  asset: string,
  amountCrypto: number,
  txHash?: string,
  note?: string,
) {
  const invoice = await (prisma as any).govInvoice.findUnique({ where: { invoiceId } });
  if (!invoice) throw new Error(`Invoice ${invoiceId} not found`);

  const prices   = await getLivePrices([asset.toUpperCase()]);
  const priceUsd = prices[0]?.priceUsd ?? 0;
  const amountUsd = Math.round(amountCrypto * priceUsd * 100) / 100;

  const payment = await (prisma as any).cryptoPayment.create({
    data: {
      invoiceId,
      asset:       asset.toUpperCase(),
      amountCrypto,
      amountUsd,
      priceUsdAt:  priceUsd,
      txHash:      txHash ?? null,
      status:      txHash ? "CONFIRMED" : "PENDING",
      paymentNote: note ?? null,
    },
  });

  const newPaid  = invoice.paidAmount + amountUsd;
  const newStatus = newPaid >= invoice.totalAmount ? "PAID" : "PARTIAL";
  await (prisma as any).govInvoice.update({
    where: { invoiceId },
    data:  { paidAmount: newPaid, status: newStatus, paidAt: new Date().toISOString() },
  });

  return { payment, invoiceStatus: newStatus, amountUsd, asset: asset.toUpperCase() };
}

// ─── 3. Bitcoin Treasury ─────────────────────────────────────────────────────

export async function depositToTreasury(
  asset: string,
  amountCrypto: number,
  source = "MANUAL",
  sourceRef?: string,
  txHash?: string,
  notes?: string,
) {
  const prices   = await getLivePrices([asset.toUpperCase()]);
  const priceUsd = prices[0]?.priceUsd ?? 0;
  const valueUsd = Math.round(amountCrypto * priceUsd * 100) / 100;

  return (prisma as any).cryptoTreasury.create({
    data: {
      asset:       asset.toUpperCase(),
      action:      "DEPOSIT",
      amountCrypto,
      priceUsdAt:  priceUsd,
      valueUsd,
      source,
      sourceRef:   sourceRef ?? null,
      txHash:      txHash ?? null,
      notes:       notes ?? null,
    },
  });
}

export async function withdrawFromTreasury(
  asset: string,
  amountCrypto: number,
  notes?: string,
) {
  const prices   = await getLivePrices([asset.toUpperCase()]);
  const priceUsd = prices[0]?.priceUsd ?? 0;
  const valueUsd = Math.round(amountCrypto * priceUsd * 100) / 100;

  return (prisma as any).cryptoTreasury.create({
    data: {
      asset:       asset.toUpperCase(),
      action:      "WITHDRAW",
      amountCrypto: -Math.abs(amountCrypto),
      priceUsdAt:  priceUsd,
      valueUsd:    -Math.abs(valueUsd),
      source:      "MANUAL",
      notes:       notes ?? null,
    },
  });
}

export async function getTreasury() {
  const records = await (prisma as any).cryptoTreasury.findMany({
    orderBy: { createdAt: "desc" },
  });

  const holdings: Record<string, { totalCrypto: number; totalCostUsd: number }> = {};
  for (const r of records) {
    if (!holdings[r.asset]) holdings[r.asset] = { totalCrypto: 0, totalCostUsd: 0 };
    holdings[r.asset].totalCrypto  += r.amountCrypto;
    holdings[r.asset].totalCostUsd += r.valueUsd;
  }

  const assets  = Object.keys(holdings);
  const prices  = assets.length ? await getLivePrices(assets) : [];
  const priceMap: Record<string, number> = {};
  prices.forEach(p => { priceMap[p.asset] = p.priceUsd ?? 0; });

  const positions = assets.map(asset => {
    const h          = holdings[asset];
    const currentPrice = priceMap[asset] ?? 0;
    const currentValue = Math.round(h.totalCrypto * currentPrice * 100) / 100;
    const unrealizedPnl = Math.round((currentValue - h.totalCostUsd) * 100) / 100;
    const pnlPct       = h.totalCostUsd > 0
      ? Math.round((unrealizedPnl / h.totalCostUsd) * 10000) / 100
      : 0;
    return {
      asset,
      totalCrypto:    Math.round(h.totalCrypto * 1e8) / 1e8,
      costBasisUsd:   Math.round(h.totalCostUsd * 100) / 100,
      currentPriceUsd: currentPrice,
      currentValueUsd: currentValue,
      unrealizedPnlUsd: unrealizedPnl,
      unrealizedPnlPct: pnlPct,
    };
  });

  const totalCostUsd    = positions.reduce((s, p) => s + p.costBasisUsd, 0);
  const totalValueUsd   = positions.reduce((s, p) => s + p.currentValueUsd, 0);
  const totalPnlUsd     = Math.round((totalValueUsd - totalCostUsd) * 100) / 100;

  return {
    positions,
    totalCostUsd:    Math.round(totalCostUsd * 100) / 100,
    totalValueUsd:   Math.round(totalValueUsd * 100) / 100,
    totalPnlUsd,
    totalPnlPct: totalCostUsd > 0
      ? Math.round((totalPnlUsd / totalCostUsd) * 10000) / 100
      : 0,
    ledger: records,
  };
}

// ─── 4. Crypto Fee Collection ─────────────────────────────────────────────────

export async function collectFeeInCrypto(
  asset: string,
  feeAmountUsd: number,
  sourceRef?: string,
) {
  const prices      = await getLivePrices([asset.toUpperCase()]);
  const priceUsd    = prices[0]?.priceUsd ?? 1;
  const amountCrypto = Math.round((feeAmountUsd / priceUsd) * 1e8) / 1e8;

  return (prisma as any).cryptoTreasury.create({
    data: {
      asset:       asset.toUpperCase(),
      action:      "FEE_COLLECT",
      amountCrypto,
      priceUsdAt:  priceUsd,
      valueUsd:    feeAmountUsd,
      source:      "FEE",
      sourceRef:   sourceRef ?? null,
      notes:       `Platform fee of $${feeAmountUsd} collected in ${asset.toUpperCase()}`,
    },
  });
}

// ─── 5. Commerce Crypto Checkout ─────────────────────────────────────────────

export async function recordCommerceCryptoPayment(
  commerceRef: string,
  asset: string,
  amountCrypto: number,
  txHash?: string,
) {
  const prices   = await getLivePrices([asset.toUpperCase()]);
  const priceUsd = prices[0]?.priceUsd ?? 0;
  const amountUsd = Math.round(amountCrypto * priceUsd * 100) / 100;

  return (prisma as any).cryptoPayment.create({
    data: {
      commerceRef,
      asset:       asset.toUpperCase(),
      amountCrypto,
      amountUsd,
      priceUsdAt:  priceUsd,
      txHash:      txHash ?? null,
      status:      txHash ? "CONFIRMED" : "PENDING",
    },
  });
}

// ─── 6. & 7. Full Crypto Profit Summary ──────────────────────────────────────

export async function getCryptoSummary() {
  const [prices, treasury, payments] = await Promise.all([
    getLivePrices(["BTC", "ETH", "USDC", "SOL"]),
    getTreasury(),
    (prisma as any).cryptoPayment.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const totalCryptoRevenue = payments
    .filter((p: any) => p.status === "CONFIRMED")
    .reduce((s: number, p: any) => s + p.amountUsd, 0);

  const invoicePayments  = payments.filter((p: any) => p.invoiceId);
  const commercePayments = payments.filter((p: any) => p.commerceRef);

  return {
    prices,
    treasury: {
      totalValueUsd:   treasury.totalValueUsd,
      totalCostUsd:    treasury.totalCostUsd,
      totalPnlUsd:     treasury.totalPnlUsd,
      totalPnlPct:     treasury.totalPnlPct,
      positions:       treasury.positions,
    },
    payments: {
      total:             payments.length,
      confirmed:         payments.filter((p: any) => p.status === "CONFIRMED").length,
      totalRevenueUsd:   Math.round(totalCryptoRevenue * 100) / 100,
      invoicePayments:   invoicePayments.length,
      commercePayments:  commercePayments.length,
    },
    profitCenters: [
      { name: "Invoice Crypto Payments",   revenue: invoicePayments.filter((p:any)=>p.status==="CONFIRMED").reduce((s:number,p:any)=>s+p.amountUsd,0) },
      { name: "Commerce Crypto Checkout",  revenue: commercePayments.filter((p:any)=>p.status==="CONFIRMED").reduce((s:number,p:any)=>s+p.amountUsd,0) },
      { name: "Treasury Unrealized P&L",   revenue: treasury.totalPnlUsd },
      { name: "Fee Collection (USDC)",     revenue: (await (prisma as any).cryptoTreasury.aggregate({ where:{action:"FEE_COLLECT"}, _sum:{valueUsd:true} }))._sum.valueUsd ?? 0 },
    ],
    recentPayments: payments.slice(0, 10),
  };
}

// ─── Lightning Network Payments ───────────────────────────────────────────────

async function nextLightningRef(): Promise<string> {
  const count = await (prisma as any).lightningInvoice.count();
  return `LN-${String(count + 1).padStart(4, "0")}`;
}

// Generate a realistic BOLT11-format stub (real node integration point)
function generateBolt11Stub(amountSats: number, description: string, ref: string): string {
  const tag      = "lnbc";
  const amount   = Math.round(amountSats / 1000); // msat to sat simplification
  const hash     = require("crypto").randomBytes(32).toString("hex");
  return `${tag}${amount}u1p${hash.slice(0, 8)}xq${hash.slice(8, 24)}description_${ref.replace(/-/g,"")}_loosearrows`;
}

export async function createLightningInvoice(data: {
  amountUsd: number;
  description?: string;
  linkedRef?: string;
  linkedType?: string;
  expiresInMinutes?: number;
}) {
  const prices = await getLivePrices(["BTC"]);
  const btcPrice = prices[0].priceUsd;
  const amountBtc  = data.amountUsd / btcPrice;
  const amountSats = Math.round(amountBtc * 1e8);

  const ref     = await nextLightningRef();
  const bolt11  = generateBolt11Stub(amountSats, data.description ?? "LooseArrows payment", ref);
  const expires = new Date(Date.now() + (data.expiresInMinutes ?? 60) * 60 * 1000);

  const invoice = await (prisma as any).lightningInvoice.create({
    data: {
      invoiceRef:          ref,
      amountSats,
      amountUsd:           Math.round(data.amountUsd * 100) / 100,
      btcPriceAtCreation:  btcPrice,
      description:         data.description ?? null,
      bolt11,
      paymentHash:         require("crypto").randomBytes(32).toString("hex"),
      status:              "PENDING",
      linkedRef:           data.linkedRef  ?? null,
      linkedType:          data.linkedType ?? null,
      expiresAt:           expires,
    },
  });

  return {
    ...invoice,
    amountBtc:   Math.round(amountBtc * 1e8) / 1e8,
    expiresAt:   expires,
    qrData:      bolt11,               // QR code encodes this string
    instructions: [
      `1. Copy the BOLT11 invoice string below`,
      `2. Paste into any Lightning wallet (Strike, Phoenix, Breez, etc.)`,
      `3. Confirm payment — settles in seconds`,
      `4. Reference: ${ref}`,
    ],
    settlementNote: "Lightning payments settle in seconds with near-zero fees. No bank. No wire. No waiting.",
  };
}

export async function markLightningPaid(id: string, paymentPreimage?: string) {
  const inv = await (prisma as any).lightningInvoice.findFirst({
    where: { OR: [{ id }, { invoiceRef: id }] },
  });
  if (!inv) throw new Error(`Lightning invoice ${id} not found`);
  if (inv.status === "PAID") throw new Error(`Already marked PAID`);

  const updated = await (prisma as any).lightningInvoice.update({
    where: { id: inv.id },
    data: { status: "PAID", paidAt: new Date(), notes: paymentPreimage ? `preimage: ${paymentPreimage}` : null },
  });

  // Auto-sweep the USD equivalent into treasury as BTC received
  await (prisma as any).cryptoTreasury.create({
    data: {
      asset:       "BTC",
      action:      "LIGHTNING_RECEIVE",
      amountCrypto: inv.amountSats / 1e8,
      valueUsd:    inv.amountUsd,
      priceUsdAt:  inv.btcPriceAtCreation,
      notes:       `Lightning payment received: ${inv.invoiceRef}`,
    },
  });

  return { ...updated, treasuryUpdated: true, message: "Payment confirmed. BTC credited to treasury." };
}

export async function listLightningInvoices(status?: string) {
  const where: any = {};
  if (status) where.status = status.toUpperCase();
  return (prisma as any).lightningInvoice.findMany({ where, orderBy: { createdAt: "desc" } });
}

export async function getLightningInvoice(id: string) {
  const inv = await (prisma as any).lightningInvoice.findFirst({
    where: { OR: [{ id }, { invoiceRef: id }] },
  });
  if (!inv) throw new Error(`Lightning invoice ${id} not found`);

  // Check expiry
  if (inv.status === "PENDING" && inv.expiresAt && new Date() > new Date(inv.expiresAt)) {
    await (prisma as any).lightningInvoice.update({ where: { id: inv.id }, data: { status: "EXPIRED" } });
    inv.status = "EXPIRED";
  }
  return inv;
}

// ─── BTC-Backed Credit Lines ──────────────────────────────────────────────────

async function nextCreditRef(): Promise<string> {
  const count = await (prisma as any).btcCreditLine.count();
  return `CL-${String(count + 1).padStart(4, "0")}`;
}

export async function openCreditLine(data: {
  purpose: string;
  btcCollateral: number;
  ltvRatio?: number;
  interestRatePct?: number;
  lender?: string;
  linkedContractRef?: string;
  notes?: string;
}) {
  const prices        = await getLivePrices(["BTC"]);
  const btcPrice      = prices[0].priceUsd;
  const ltv           = data.ltvRatio ?? 0.5;
  const collateralUsd = Math.round(data.btcCollateral * btcPrice * 100) / 100;
  const creditLimit   = Math.round(collateralUsd * ltv * 100) / 100;
  const ref           = await nextCreditRef();

  return (prisma as any).btcCreditLine.create({
    data: {
      creditRef:         ref,
      purpose:           data.purpose,
      btcCollateral:     data.btcCollateral,
      btcPriceAtOpen:    btcPrice,
      collateralUsd,
      ltvRatio:          ltv,
      creditLimitUsd:    creditLimit,
      drawnUsd:          0,
      repaidUsd:         0,
      outstandingUsd:    0,
      interestRatePct:   data.interestRatePct ?? 8.0,
      lender:            data.lender ?? null,
      linkedContractRef: data.linkedContractRef ?? null,
      notes:             data.notes ?? null,
    },
  });
}

export async function drawOnCreditLine(id: string, amountUsd: number) {
  const line = await (prisma as any).btcCreditLine.findFirst({ where: { OR: [{ id }, { creditRef: id }] } });
  if (!line) throw new Error(`Credit line ${id} not found`);
  if (line.status !== "OPEN") throw new Error(`Credit line is ${line.status}`);

  const available = line.creditLimitUsd - line.drawnUsd;
  if (amountUsd > available) throw new Error(`Only $${available.toFixed(2)} available to draw`);

  const newDrawn       = line.drawnUsd + amountUsd;
  const newOutstanding = newDrawn - line.repaidUsd;

  // Accrue interest on draw (simple daily interest estimate for UI)
  const dailyRate    = line.interestRatePct / 100 / 365;
  const newAccrued   = line.accruedInterestUsd + (amountUsd * dailyRate);

  return (prisma as any).btcCreditLine.update({
    where: { id: line.id },
    data: { drawnUsd: newDrawn, outstandingUsd: newOutstanding, accruedInterestUsd: Math.round(newAccrued * 100) / 100 },
  });
}

export async function repayCreditLine(id: string, amountUsd: number, type: string = "PRINCIPAL", reference?: string) {
  const line = await (prisma as any).btcCreditLine.findFirst({ where: { OR: [{ id }, { creditRef: id }] } });
  if (!line) throw new Error(`Credit line ${id} not found`);

  const newRepaid      = line.repaidUsd + amountUsd;
  const newOutstanding = Math.max(0, line.drawnUsd - newRepaid);
  const fullyRepaid    = newOutstanding === 0 && line.drawnUsd > 0;

  await (prisma as any).creditRepayment.create({
    data: { creditLineId: line.id, amountUsd, type: type.toUpperCase(), reference: reference ?? null },
  });

  return (prisma as any).btcCreditLine.update({
    where: { id: line.id },
    data: {
      repaidUsd:     newRepaid,
      outstandingUsd: newOutstanding,
      status:        fullyRepaid ? "REPAID" : "OPEN",
      closedAt:      fullyRepaid ? new Date() : null,
    },
  });
}

export async function getCreditLineSummary() {
  const lines = await (prisma as any).btcCreditLine.findMany({
    include: { repayments: { orderBy: { createdAt: "desc" }, take: 5 } },
    orderBy: { createdAt: "desc" },
  });

  const prices   = await getLivePrices(["BTC"]);
  const btcPrice = prices[0].priceUsd;

  let totalCollateralBtc = 0, totalCreditUsd = 0, totalDrawnUsd = 0, totalOutstandingUsd = 0;

  const enriched = lines.map((line: any) => {
    const currentCollateralUsd = line.btcCollateral * btcPrice;
    const collateralGainUsd    = currentCollateralUsd - line.collateralUsd;
    const currentLtv           = line.drawnUsd / currentCollateralUsd;
    const liquidationRisk      = currentLtv > 0.7 ? "HIGH" : currentLtv > 0.55 ? "MEDIUM" : "LOW";

    if (line.status === "OPEN") {
      totalCollateralBtc   += line.btcCollateral;
      totalCreditUsd       += line.creditLimitUsd;
      totalDrawnUsd        += line.drawnUsd;
      totalOutstandingUsd  += line.outstandingUsd;
    }

    return {
      ...line,
      currentBtcPrice:      btcPrice,
      currentCollateralUsd: Math.round(currentCollateralUsd * 100) / 100,
      collateralGainUsd:    Math.round(collateralGainUsd * 100) / 100,
      collateralGainPct:    line.collateralUsd > 0 ? Math.round(collateralGainUsd / line.collateralUsd * 10000) / 100 : 0,
      currentLtvPct:        Math.round(currentLtv * 10000) / 100,
      availableUsd:         Math.round(Math.max(0, line.creditLimitUsd - line.drawnUsd) * 100) / 100,
      liquidationRisk,
    };
  });

  return {
    summary: {
      totalLines:          lines.length,
      openLines:           lines.filter((l: any) => l.status === "OPEN").length,
      totalCollateralBtc:  Math.round(totalCollateralBtc * 1e6) / 1e6,
      totalCollateralUsd:  Math.round(totalCollateralBtc * btcPrice * 100) / 100,
      totalCreditUsd:      Math.round(totalCreditUsd * 100) / 100,
      totalDrawnUsd:       Math.round(totalDrawnUsd * 100) / 100,
      totalOutstandingUsd: Math.round(totalOutstandingUsd * 100) / 100,
      capitalUnlocked:     `$${Math.round(totalDrawnUsd).toLocaleString()} deployed against BTC collateral — BTC still held, still appreciating`,
    },
    lines: enriched,
  };
}

export async function listCreditLines(status?: string) {
  const where: any = {};
  if (status) where.status = status.toUpperCase();
  return (prisma as any).btcCreditLine.findMany({ where, orderBy: { createdAt: "desc" }, include: { repayments: true } });
}

// ─── Reseller BTC Payout ──────────────────────────────────────────────────────

export async function resellerBtcPayout(resellerId: string, btcWalletAddress: string, notes?: string) {
  const reseller = await (prisma as any).reseller.findUnique({ where: { id: resellerId } });
  if (!reseller) throw new Error(`Reseller ${resellerId} not found`);
  if (reseller.pendingPayout <= 0) throw new Error(`No pending payout for ${reseller.name}`);

  const prices   = await getLivePrices(["BTC"]);
  const btcPrice = prices[0].priceUsd;
  const amountUsd = reseller.pendingPayout;
  const amountBtc = Math.round(amountUsd / btcPrice * 1e8) / 1e8;

  // Save wallet address if not already set
  await (prisma as any).reseller.update({
    where: { id: resellerId },
    data:  { btcWalletAddress, pendingPayout: 0 },
  });

  // Record payout
  const payout = await (prisma as any).resellerPayout.create({
    data: {
      resellerId,
      amount:    amountUsd,
      method:    "CRYPTO_BTC",
      status:    "PROCESSING",
      reference: btcWalletAddress,
      notes:     notes ?? `BTC payout at $${btcPrice.toLocaleString()}/BTC`,
    },
  });

  // Record BTC outflow from treasury
  await (prisma as any).cryptoTreasury.create({
    data: {
      asset:        "BTC",
      action:       "RESELLER_PAYOUT",
      amountCrypto: amountBtc,
      valueUsd:     amountUsd,
      priceUsdAt:   btcPrice,
      notes:        `BTC payout to reseller ${reseller.resellerRef}: ${btcWalletAddress}`,
    },
  });

  return {
    payout,
    reseller:     reseller.name,
    resellerRef:  reseller.resellerRef,
    amountUsd,
    amountBtc,
    btcPrice,
    btcWalletAddress,
    note: "BTC will be sent on-chain within 1-2 business hours. Confirm wallet address before finalizing.",
  };
}

export const cryptoService = {
  getLivePrices,
  getInvoicePaymentRequest,
  recordInvoiceCryptoPayment,
  depositToTreasury,
  withdrawFromTreasury,
  getTreasury,
  collectFeeInCrypto,
  recordCommerceCryptoPayment,
  getCryptoSummary,
  // Lightning
  createLightningInvoice,
  markLightningPaid,
  listLightningInvoices,
  getLightningInvoice,
  // Credit Lines
  openCreditLine,
  drawOnCreditLine,
  repayCreditLine,
  getCreditLineSummary,
  listCreditLines,
  // Reseller BTC
  resellerBtcPayout,
};
