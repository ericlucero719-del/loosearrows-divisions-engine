// modules/sam/sam.service.ts
// LooseArrows Supply & Logistics™ — SAM.gov Integration
// Searches federal contract opportunities via api.sam.gov public API
// and maintains a local watchlist tied to your Division 8 NAICS codes.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SAM_KEY = process.env.SAM_GOV_API_KEY ?? "";
const SAM_BASE = "https://api.sam.gov/opportunities/v2/search";

// ─── SAM.gov API fetch ─────────────────────────────────────────────────────────

// SAM.gov requires PostedFrom + PostedTo (mm/dd/yyyy). Default: last 180 days → today.
function defaultDateRange(): { postedFrom: string; postedTo: string } {
  const fmt = (d: Date) =>
    `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
  const to   = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 180);
  return { postedFrom: fmt(from), postedTo: fmt(to) };
}

async function samSearch(params: Record<string, string>): Promise<any> {
  if (!SAM_KEY) {
    throw new Error(
      "SAM_GOV_API_KEY is not set. Get your free API key at https://sam.gov/profile/details " +
      "then add it as the SAM_GOV_API_KEY environment variable."
    );
  }
  const { postedFrom, postedTo } = defaultDateRange();
  const qs = new URLSearchParams({
    limit:      "25",
    offset:     "0",
    postedFrom,
    postedTo,
    ...params,
    api_key: SAM_KEY,
  });
  const url = `${SAM_BASE}?${qs}`;
  const res  = await fetch(url, { headers: { Accept: "application/json" } });
  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try { detail = JSON.stringify(JSON.parse(text)); } catch { /* keep raw */ }
    throw new Error(`SAM.gov API error ${res.status}: ${detail}`);
  }
  if (!text) throw new Error("SAM.gov returned an empty response.");
  return JSON.parse(text);
}

function mapOpportunity(o: any) {
  return {
    noticeId:        o.noticeId,
    title:           o.title ?? "Untitled",
    agency:          o.fullParentPathName ?? o.organizationHierarchy?.[0]?.name ?? null,
    naicsCode:       o.naicsCode ?? null,
    postedDate:      o.postedDate ?? null,
    responseDeadline: o.responseDeadline ?? null,
    setAside:        o.typeOfSetAside ?? null,
    placeOfPerf:     o.placeOfPerformance?.city?.name ?? null,
    description:     (o.description ?? "").slice(0, 1000),
    solicitationNum: o.solicitationNumber ?? null,
    awardAmount:     o.award?.amount ? parseFloat(o.award.amount) : null,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const samService = {

  // Search live opportunities on SAM.gov
  async search(opts: { keyword?: string; naics?: string; limit?: number; offset?: number }) {
    const params: Record<string, string> = {
      limit:  String(opts.limit  ?? 25),
      offset: String(opts.offset ?? 0),
    };
    if (opts.keyword) params.q         = opts.keyword;
    if (opts.naics)   params.naicsCode = opts.naics;

    const data = await samSearch(params);
    const opps = (data.opportunitiesData ?? []).map(mapOpportunity);
    return {
      total:         data.totalRecords ?? opps.length,
      returned:      opps.length,
      opportunities: opps,
    };
  },

  // Search and auto-match against your Division 8 agency NAICS codes
  async matchToAgencies() {
    const agencies = await (prisma as any).govAgency.findMany({
      select: { agencyId: true, name: true, naicsJson: true },
    });

    const results: Array<{ agency: string; naics: string; matches: any[] }> = [];

    for (const agency of agencies) {
      const codes: string[] = JSON.parse(agency.naicsJson || "[]");
      for (const naics of codes.slice(0, 3)) { // limit API calls
        try {
          const data = await samSearch({ ncode: naics, limit: "5" });
          const opps = (data.opportunitiesData ?? []).map(mapOpportunity);
          if (opps.length) results.push({ agency: agency.name, naics, matches: opps });
        } catch { /* skip failed code */ }
      }
    }

    return results;
  },

  // Save opportunity to watchlist.
  // If SAM_GOV_API_KEY is set it auto-fetches live data; otherwise use the
  // fields supplied in `manual` (title, naicsCode, awardAmount, etc.).
  async addToWatchlist(
    noticeId: string,
    status   = "WATCHING",
    notes?:    string,
    manual?:   Record<string, any>,
  ) {
    let mapped: Record<string, any> = { noticeId, ...(manual ?? {}) };

    // Try to enrich from SAM.gov if key is available
    if (SAM_KEY) {
      try {
        const data = await samSearch({ noticeid: noticeId, limit: "1" });
        const opp  = (data.opportunitiesData ?? [])[0];
        if (opp) mapped = { ...mapped, ...mapOpportunity(opp) };
      } catch { /* key might be inactive — fall back to manual fields */ }
    }

    return (prisma as any).samOpportunity.upsert({
      where:  { noticeId },
      create: { ...mapped, status, notes },
      update: { status, notes, ...mapped },
    });
  },

  // List watchlist
  async listWatchlist(status?: string) {
    const where = status ? { status } : {};
    const rows  = await (prisma as any).samOpportunity.findMany({
      where, orderBy: { createdAt: "desc" },
    });
    return rows.map((r: any) => ({
      ...r,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
    }));
  },

  // Update watchlist status
  async updateStatus(noticeId: string, status: string, notes?: string) {
    return (prisma as any).samOpportunity.update({
      where: { noticeId },
      data:  { status, ...(notes ? { notes } : {}) },
    });
  },

  // Delete from watchlist
  async removeFromWatchlist(noticeId: string) {
    return (prisma as any).samOpportunity.delete({ where: { noticeId } });
  },

  // Watchlist summary
  async watchlistSummary() {
    const rows = await (prisma as any).samOpportunity.findMany();
    const byStatus: Record<string, number> = {};
    let totalAwardValue = 0;
    for (const r of rows) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
      totalAwardValue += r.awardAmount ?? 0;
    }
    return {
      total:           rows.length,
      totalAwardValue: Math.round(totalAwardValue * 100) / 100,
      byStatus,
    };
  },
};
