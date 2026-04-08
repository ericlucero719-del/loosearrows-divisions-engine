"use strict";
// modules/billing/billing.service.ts
// LooseArrows Supply & Logistics™ — Transaction Fee & Billing Engine
// Charges a percentage of contract value processed through the pipeline.
// Default rate: 0.75% per transaction, $25 minimum.
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingService = void 0;
exports.calcFee = calcFee;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const DEFAULT_RATE = 0.0075; // 0.75%
const DEFAULT_MIN_FEE = 25; // $25 minimum
// ─── Fee calculator ───────────────────────────────────────────────────────────
function calcFee(contractValue, feeRate = DEFAULT_RATE, minFee = DEFAULT_MIN_FEE, maxFee) {
    let fee = contractValue * feeRate;
    if (fee < minFee)
        fee = minFee;
    if (maxFee && fee > maxFee)
        fee = maxFee;
    return Math.round(fee * 100) / 100;
}
// ─── Service ──────────────────────────────────────────────────────────────────
exports.billingService = {
    // Estimate fee for a given contract value + platform
    async estimate(contractValue, platform = "DEFAULT") {
        const cfg = await prisma.billingConfig.findUnique({ where: { platform } })
            ?? await prisma.billingConfig.findUnique({ where: { platform: "DEFAULT" } });
        const feeRate = cfg?.feeRate ?? DEFAULT_RATE;
        const minFee = cfg?.minFeeUsd ?? DEFAULT_MIN_FEE;
        const maxFee = cfg?.maxFeeUsd ?? undefined;
        const fee = calcFee(contractValue, feeRate, minFee, maxFee);
        const netValue = Math.round((contractValue - fee) * 100) / 100;
        return {
            platform,
            contractValue: Math.round(contractValue * 100) / 100,
            feeRate: `${(feeRate * 100).toFixed(2)}%`,
            feeAmountUsd: fee,
            minFeeUsd: minFee,
            maxFeeUsd: maxFee ?? "none",
            netToVendor: netValue,
            looseArrowsRev: fee,
        };
    },
    // Get or seed billing config for a platform
    async getConfig(platform) {
        const existing = await prisma.billingConfig.findUnique({ where: { platform } });
        if (existing)
            return existing;
        // Seed default
        return prisma.billingConfig.create({
            data: { platform, feeRate: DEFAULT_RATE, minFeeUsd: DEFAULT_MIN_FEE },
        });
    },
    // Update fee config for a platform
    async updateConfig(platform, feeRate, minFeeUsd, maxFeeUsd, notes) {
        return prisma.billingConfig.upsert({
            where: { platform },
            create: { platform, feeRate, minFeeUsd, maxFeeUsd, notes },
            update: { feeRate, minFeeUsd, maxFeeUsd, notes },
        });
    },
    // List all platform billing configs
    async listConfigs() {
        return prisma.billingConfig.findMany({ orderBy: { platform: "asc" } });
    },
    // Revenue report — fees earned across all commerce orders
    async revenueReport() {
        const commerce = await prisma.commerceOrder.findMany({
            select: { platform: true, feeAmountUsd: true, status: true, createdAt: true },
        });
        const tiktok = await prisma.tikTokOrder.findMany({
            select: { profitUsd: true, status: true, createdAt: true },
        });
        const byPlatform = {};
        for (const o of commerce) {
            if (!byPlatform[o.platform])
                byPlatform[o.platform] = { orders: 0, feeRevenue: 0 };
            byPlatform[o.platform].orders++;
            byPlatform[o.platform].feeRevenue += o.feeAmountUsd ?? 0;
        }
        const ttFee = tiktok.reduce((s, o) => s + (o.profitUsd ?? 0) * DEFAULT_RATE, 0);
        if (tiktok.length)
            byPlatform["TIKTOK"] = { orders: tiktok.length, feeRevenue: Math.round(ttFee * 100) / 100 };
        const totalFeeRevenue = Object.values(byPlatform).reduce((s, p) => s + p.feeRevenue, 0);
        return {
            totalFeeRevenue: Math.round(totalFeeRevenue * 100) / 100,
            defaultFeeRate: `${(DEFAULT_RATE * 100).toFixed(2)}%`,
            byPlatform,
            projectedAnnual: Math.round(totalFeeRevenue * 12 * 100) / 100,
        };
    },
};
//# sourceMappingURL=billing.service.js.map