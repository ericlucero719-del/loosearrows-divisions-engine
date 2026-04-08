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
};
