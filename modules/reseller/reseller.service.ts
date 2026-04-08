// modules/reseller/reseller.service.ts
// LooseArrows Supply & Logistics™ — Reseller Network Engine
//
// Profit model:
//   STARTER       $0 – $5K/mo GMV    →  1.50% platform fee
//   STANDARD      $5K – $25K/mo      →  0.75% platform fee
//   PROFESSIONAL  $25K – $100K/mo    →  0.50% platform fee
//   ELITE         $100K+/mo          →  0.35% platform fee
//
// Revenue streams per reseller:
//   1. Transaction fee (tier-based % of every order)
//   2. Monthly SaaS subscription (configurable per tier)
//   3. Crypto conversion spread (when paying out in BTC/USDC)
//   4. Float income (hold period before payout)

import { PrismaClient } from "@prisma/client";
import { randomBytes }  from "crypto";

const prisma = new PrismaClient();

// ─── Tier Configuration ───────────────────────────────────────────────────────

export const TIERS: Record<string, {
  label: string; minMonthlyGmv: number; maxMonthlyGmv: number | null;
  feeRate: number; subscriptionUsd: number;
}> = {
  STARTER:      { label: "Starter",      minMonthlyGmv: 0,      maxMonthlyGmv: 5000,   feeRate: 0.015,  subscriptionUsd: 0    },
  STANDARD:     { label: "Standard",     minMonthlyGmv: 5000,   maxMonthlyGmv: 25000,  feeRate: 0.0075, subscriptionUsd: 49   },
  PROFESSIONAL: { label: "Professional", minMonthlyGmv: 25000,  maxMonthlyGmv: 100000, feeRate: 0.005,  subscriptionUsd: 149  },
  ELITE:        { label: "Elite",        minMonthlyGmv: 100000, maxMonthlyGmv: null,   feeRate: 0.0035, subscriptionUsd: 499  },
};

function assignTier(monthlyGmv: number): string {
  if (monthlyGmv >= 100000) return "ELITE";
  if (monthlyGmv >= 25000)  return "PROFESSIONAL";
  if (monthlyGmv >= 5000)   return "STANDARD";
  return "STARTER";
}

function generateApiKey(): string {
  return `la-rsl-${randomBytes(20).toString("hex")}`;
}

async function nextResellerRef(): Promise<string> {
  const count = await (prisma as any).reseller.count();
  return `RSL-${String(count + 1).padStart(4, "0")}`;
}

// ─── 1. Onboarding ────────────────────────────────────────────────────────────

export async function registerReseller(data: {
  name: string; email: string; platform?: string; notes?: string;
}) {
  const existing = await (prisma as any).reseller.findUnique({ where: { email: data.email } });
  if (existing) throw new Error(`Reseller with email ${data.email} already registered (${existing.resellerRef})`);

  const apiKey      = generateApiKey();
  const resellerRef = await nextResellerRef();
  const tier        = "STARTER";
  const feeRate     = TIERS[tier].feeRate;

  const reseller = await (prisma as any).reseller.create({
    data: {
      resellerRef,
      name:     data.name,
      email:    data.email,
      platform: (data.platform ?? "TIKTOK").toUpperCase(),
      apiKey,
      tier,
      feeRate,
      status:   "ACTIVE",
      notes:    data.notes ?? null,
    },
  });

  // Also register in main ApiKey table so vendor portal works
  await (prisma as any).apiKey.create({
    data: {
      key:        apiKey,
      tier:       "OPERATOR",
      ownerName:  data.name,
      ownerEmail: data.email,
      notes:      `Reseller ${resellerRef}`,
    },
  });

  return {
    ...reseller,
    tier:           TIERS[tier],
    message:        `Welcome to Loose Arrows Reseller Network! Your API key is below — keep it secure.`,
    apiKey,         // shown once on registration
  };
}

// ─── 2. Record a Sale (called by TikTok/Commerce pipeline) ───────────────────

export async function recordSale(resellerId: string, grossSaleUsd: number) {
  const reseller = await (prisma as any).reseller.findUnique({ where: { id: resellerId } });
  if (!reseller) throw new Error(`Reseller ${resellerId} not found`);

  const feeRate   = reseller.feeRate;
  const feeAmount = Math.round(grossSaleUsd * feeRate * 100) / 100;
  const netEarned = Math.round((grossSaleUsd - feeAmount) * 100) / 100;

  // Recalculate tier based on updated monthly GMV
  const newMonthlyGmv = reseller.monthlyGmv + grossSaleUsd;
  const newTier       = assignTier(newMonthlyGmv);
  const newFeeRate    = TIERS[newTier].feeRate;

  await (prisma as any).reseller.update({
    where: { id: resellerId },
    data: {
      totalGmv:     { increment: grossSaleUsd },
      totalFeesPaid:{ increment: feeAmount },
      totalEarnings:{ increment: netEarned },
      pendingPayout:{ increment: netEarned },
      monthlyGmv:   { increment: grossSaleUsd },
      tier:         newTier,
      feeRate:      newFeeRate,
    },
  });

  return {
    grossSaleUsd,
    feeRate:       `${(feeRate * 100).toFixed(2)}%`,
    platformFeeUsd: feeAmount,
    netToResellerUsd: netEarned,
    newTier,
    tierUpgraded:  newTier !== reseller.tier,
  };
}

// ─── 3. Payout Processing ─────────────────────────────────────────────────────

export async function processPayout(
  resellerId: string,
  method: string = "ACH",
  reference?: string,
  notes?: string,
) {
  const reseller = await (prisma as any).reseller.findUnique({ where: { id: resellerId } });
  if (!reseller) throw new Error(`Reseller ${resellerId} not found`);
  if (reseller.pendingPayout <= 0) throw new Error(`No pending payout balance for ${reseller.name}`);

  const amount = reseller.pendingPayout;
  const now    = new Date();
  const periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const periodEnd   = now.toISOString().slice(0, 10);

  const payout = await (prisma as any).resellerPayout.create({
    data: {
      resellerId,
      amount,
      method:       method.toUpperCase(),
      status:       "PROCESSING",
      reference:    reference ?? null,
      periodStart,
      periodEnd,
      notes:        notes ?? null,
    },
  });

  await (prisma as any).reseller.update({
    where: { id: resellerId },
    data:  { pendingPayout: 0 },
  });

  return { payout, amount, method, reseller: reseller.name };
}

// ─── 4. Earnings Breakdown ────────────────────────────────────────────────────

export async function getEarnings(resellerId: string) {
  const reseller = await (prisma as any).reseller.findUnique({ where: { id: resellerId } });
  if (!reseller) throw new Error(`Reseller ${resellerId} not found`);
  const payouts  = await (prisma as any).resellerPayout.findMany({
    where:   { resellerId },
    orderBy: { createdAt: "desc" },
  });

  const tier = TIERS[reseller.tier] ?? TIERS.STARTER;

  return {
    reseller: {
      ref:         reseller.resellerRef,
      name:        reseller.name,
      platform:    reseller.platform,
      status:      reseller.status,
    },
    tier: {
      current:         reseller.tier,
      label:           tier.label,
      feeRate:         `${(reseller.feeRate * 100).toFixed(2)}%`,
      subscriptionUsd: tier.subscriptionUsd,
      nextTier:        reseller.tier === "ELITE" ? null : Object.entries(TIERS).find(([k, t]) => t.minMonthlyGmv > (TIERS[reseller.tier]?.minMonthlyGmv ?? 0))?.[0] ?? null,
      gmvToNextTier:   tier.maxMonthlyGmv ? Math.max(0, tier.maxMonthlyGmv - reseller.monthlyGmv) : 0,
    },
    earnings: {
      lifetimeGmv:     reseller.totalGmv,
      lifetimeFees:    reseller.totalFeesPaid,
      lifetimeNet:     reseller.totalEarnings,
      pendingPayout:   reseller.pendingPayout,
      monthlyGmv:      reseller.monthlyGmv,
      effectiveFeeRate:`${(reseller.totalFeesPaid / (reseller.totalGmv || 1) * 100).toFixed(2)}%`,
    },
    payoutHistory: payouts,
    platformRevenue: {
      fromThisReseller: reseller.totalFeesPaid,
      note: "Platform earns the fee on every transaction this reseller processes",
    },
  };
}

// ─── 5. Platform-Wide Summary ─────────────────────────────────────────────────

export async function getResellerSummary() {
  const resellers = await (prisma as any).reseller.findMany({ orderBy: { totalGmv: "desc" } });

  const byTier: Record<string, number> = {};
  let totalGmv = 0, totalFees = 0, totalPending = 0;

  for (const r of resellers) {
    byTier[r.tier] = (byTier[r.tier] ?? 0) + 1;
    totalGmv     += r.totalGmv;
    totalFees    += r.totalFeesPaid;
    totalPending += r.pendingPayout;
  }

  const projections = {
    at1K:  { resellers: 1000,  avgMonthlyGmv: 500,  feeRate: 0.015,  monthlyFeeRevenue: 1000  * 500  * 0.015 },
    at5K:  { resellers: 5000,  avgMonthlyGmv: 800,  feeRate: 0.01,   monthlyFeeRevenue: 5000  * 800  * 0.01  },
    at20K: { resellers: 20000, avgMonthlyGmv: 1000, feeRate: 0.0075, monthlyFeeRevenue: 20000 * 1000 * 0.0075 },
  };

  return {
    totalResellers:  resellers.length,
    activeResellers: resellers.filter((r: any) => r.status === "ACTIVE").length,
    byTier,
    financials: {
      totalGmvProcessed:   Math.round(totalGmv   * 100) / 100,
      totalPlatformFees:   Math.round(totalFees  * 100) / 100,
      totalPendingPayouts: Math.round(totalPending * 100) / 100,
    },
    topResellers: resellers.slice(0, 10).map((r: any) => ({
      ref:          r.resellerRef,
      name:         r.name,
      platform:     r.platform,
      tier:         r.tier,
      totalGmv:     r.totalGmv,
      feesGenerated: r.totalFeesPaid,
    })),
    projections,
  };
}

// ─── 6. Simulate Scale ────────────────────────────────────────────────────────

export function simulateScale(resellerCount: number, avgMonthlyGmvPerReseller: number) {
  const monthlyGmv = resellerCount * avgMonthlyGmvPerReseller;

  const tierMix = {
    STARTER:      Math.round(resellerCount * 0.6),
    STANDARD:     Math.round(resellerCount * 0.28),
    PROFESSIONAL: Math.round(resellerCount * 0.1),
    ELITE:        Math.round(resellerCount * 0.02),
  };

  const monthlyFees =
    tierMix.STARTER      * avgMonthlyGmvPerReseller * TIERS.STARTER.feeRate +
    tierMix.STANDARD     * avgMonthlyGmvPerReseller * TIERS.STANDARD.feeRate +
    tierMix.PROFESSIONAL * avgMonthlyGmvPerReseller * TIERS.PROFESSIONAL.feeRate +
    tierMix.ELITE        * avgMonthlyGmvPerReseller * TIERS.ELITE.feeRate;

  const monthlySubscriptions =
    tierMix.STANDARD     * TIERS.STANDARD.subscriptionUsd +
    tierMix.PROFESSIONAL * TIERS.PROFESSIONAL.subscriptionUsd +
    tierMix.ELITE        * TIERS.ELITE.subscriptionUsd;

  return {
    inputs:  { resellerCount, avgMonthlyGmvPerReseller },
    monthly: {
      grossMerchandiseVolume: Math.round(monthlyGmv),
      transactionFeeRevenue:  Math.round(monthlyFees),
      subscriptionRevenue:    Math.round(monthlySubscriptions),
      totalPlatformRevenue:   Math.round(monthlyFees + monthlySubscriptions),
    },
    annual: {
      grossMerchandiseVolume: Math.round(monthlyGmv * 12),
      transactionFeeRevenue:  Math.round(monthlyFees * 12),
      subscriptionRevenue:    Math.round(monthlySubscriptions * 12),
      totalPlatformRevenue:   Math.round((monthlyFees + monthlySubscriptions) * 12),
    },
    tierBreakdown: tierMix,
    btcTreasury: {
      monthlyFeesInBtc: `~${(monthlyFees / 71000).toFixed(4)} BTC/month at $71K`,
      annualFeesInBtc:  `~${(monthlyFees * 12 / 71000).toFixed(3)} BTC/year at $71K`,
    },
  };
}

// ─── 7. List Resellers ────────────────────────────────────────────────────────

export async function listResellers(status?: string, tier?: string) {
  const where: any = {};
  if (status) where.status = status.toUpperCase();
  if (tier)   where.tier   = tier.toUpperCase();
  return (prisma as any).reseller.findMany({
    where, orderBy: { totalGmv: "desc" },
    select: {
      id: true, resellerRef: true, name: true, email: true,
      platform: true, tier: true, feeRate: true, status: true,
      totalGmv: true, totalFeesPaid: true, pendingPayout: true,
      monthlyGmv: true, createdAt: true,
    },
  });
}

export async function getReseller(id: string) {
  const r = await (prisma as any).reseller.findFirst({
    where: { OR: [{ id }, { resellerRef: id }, { email: id }] },
    include: { payouts: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
  if (!r) throw new Error(`Reseller ${id} not found`);
  return r;
}

export async function updateResellerStatus(id: string, status: string) {
  return (prisma as any).reseller.update({ where: { id }, data: { status: status.toUpperCase() } });
}

export const resellerService = {
  registerReseller, recordSale, processPayout, getEarnings,
  getResellerSummary, simulateScale, listResellers, getReseller, updateResellerStatus,
  TIERS,
};
