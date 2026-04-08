"use strict";
// modules/sam/sam.service.ts
// LooseArrows Supply & Logistics™ — SAM.gov Integration
// Searches federal contract opportunities via api.sam.gov public API
// and maintains a local watchlist tied to your Division 8 NAICS codes.
Object.defineProperty(exports, "__esModule", { value: true });
exports.samService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const SAM_KEY = process.env.SAM_GOV_API_KEY ?? "";
const SAM_BASE = "https://api.sam.gov/opportunities/v2/search";
// ─── SAM.gov API fetch ─────────────────────────────────────────────────────────
// SAM.gov requires PostedFrom + PostedTo (mm/dd/yyyy). Default: last 180 days → today.
function defaultDateRange() {
    const fmt = (d) => `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 180);
    return { postedFrom: fmt(from), postedTo: fmt(to) };
}
async function samSearch(params) {
    if (!SAM_KEY) {
        throw new Error("SAM_GOV_API_KEY is not set. Get your free API key at https://sam.gov/profile/details " +
            "then add it as the SAM_GOV_API_KEY environment variable.");
    }
    const { postedFrom, postedTo } = defaultDateRange();
    const qs = new URLSearchParams({
        limit: "25",
        offset: "0",
        postedFrom,
        postedTo,
        ...params,
        api_key: SAM_KEY,
    });
    const url = `${SAM_BASE}?${qs}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const text = await res.text();
    if (!res.ok) {
        let detail = text;
        try {
            detail = JSON.stringify(JSON.parse(text));
        }
        catch { /* keep raw */ }
        throw new Error(`SAM.gov API error ${res.status}: ${detail}`);
    }
    if (!text)
        throw new Error("SAM.gov returned an empty response.");
    return JSON.parse(text);
}
function mapOpportunity(o) {
    return {
        noticeId: o.noticeId,
        title: o.title ?? "Untitled",
        agency: o.fullParentPathName ?? o.organizationHierarchy?.[0]?.name ?? null,
        naicsCode: o.naicsCode ?? null,
        postedDate: o.postedDate ?? null,
        responseDeadline: o.responseDeadline ?? null,
        setAside: o.typeOfSetAside ?? null,
        placeOfPerf: o.placeOfPerformance?.city?.name ?? null,
        description: (o.description ?? "").slice(0, 1000),
        solicitationNum: o.solicitationNumber ?? null,
        awardAmount: o.award?.amount ? parseFloat(o.award.amount) : null,
    };
}
// ─── Service ──────────────────────────────────────────────────────────────────
exports.samService = {
    // Search live opportunities on SAM.gov
    async search(opts) {
        const params = {
            limit: String(opts.limit ?? 25),
            offset: String(opts.offset ?? 0),
        };
        if (opts.keyword)
            params.q = opts.keyword;
        if (opts.naics)
            params.naicsCode = opts.naics;
        const data = await samSearch(params);
        const opps = (data.opportunitiesData ?? []).map(mapOpportunity);
        return {
            total: data.totalRecords ?? opps.length,
            returned: opps.length,
            opportunities: opps,
        };
    },
    // Search and auto-match against your Division 8 agency NAICS codes
    async matchToAgencies() {
        const agencies = await prisma.govAgency.findMany({
            select: { id: true, name: true, naicsCodesJson: true },
        });
        const results = [];
        for (const agency of agencies) {
            const codes = JSON.parse(agency.naicsCodesJson || "[]");
            for (const naics of codes.slice(0, 3)) { // limit API calls
                try {
                    const data = await samSearch({ ncode: naics, limit: "5" });
                    const opps = (data.opportunitiesData ?? []).map(mapOpportunity);
                    if (opps.length)
                        results.push({ agency: agency.name, naics, matches: opps });
                }
                catch { /* skip failed code */ }
            }
        }
        return results;
    },
    // Save opportunity to watchlist.
    // If SAM_GOV_API_KEY is set it auto-fetches live data; otherwise use the
    // fields supplied in `manual` (title, naicsCode, awardAmount, etc.).
    async addToWatchlist(noticeId, status = "WATCHING", notes, manual) {
        let mapped = { noticeId, ...(manual ?? {}) };
        // Try to enrich from SAM.gov if key is available
        if (SAM_KEY) {
            try {
                const data = await samSearch({ noticeid: noticeId, limit: "1" });
                const opp = (data.opportunitiesData ?? [])[0];
                if (opp)
                    mapped = { ...mapped, ...mapOpportunity(opp) };
            }
            catch { /* key might be inactive — fall back to manual fields */ }
        }
        return prisma.samOpportunity.upsert({
            where: { noticeId },
            create: { ...mapped, status, notes },
            update: { status, notes, ...mapped },
        });
    },
    // List watchlist
    async listWatchlist(status) {
        const where = status ? { status } : {};
        const rows = await prisma.samOpportunity.findMany({
            where, orderBy: { createdAt: "desc" },
        });
        return rows.map((r) => ({
            ...r,
            createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
            updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
        }));
    },
    // Update watchlist status
    async updateStatus(noticeId, status, notes) {
        return prisma.samOpportunity.update({
            where: { noticeId },
            data: { status, ...(notes ? { notes } : {}) },
        });
    },
    // Delete from watchlist
    async removeFromWatchlist(noticeId) {
        return prisma.samOpportunity.delete({ where: { noticeId } });
    },
    // Watchlist summary
    async watchlistSummary() {
        const rows = await prisma.samOpportunity.findMany();
        const byStatus = {};
        let totalAwardValue = 0;
        for (const r of rows) {
            byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
            totalAwardValue += r.awardAmount ?? 0;
        }
        return {
            total: rows.length,
            totalAwardValue: Math.round(totalAwardValue * 100) / 100,
            byStatus,
        };
    },
};
//# sourceMappingURL=sam.service.js.map