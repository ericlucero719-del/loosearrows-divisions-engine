// modules/division10/division10.sam.bridge.ts
// SAM.gov → Registry Bridge for DIV10-BOT-001
// Pulls live federal opportunities from SAM.gov and loads them into the
// in-memory registry so the bot's discover step can process them.

import { registry } from "../../src/core/engine";

const SAM_BASE = "https://api.sam.gov/opportunities/v2/search";

// Division keyword + NAICS mapping — bot searches all 10 concurrently
const DIVISION_SEARCHES = [
  { division: "1",  keyword: "office supplies stationery",       naics: "424120" },
  { division: "2",  keyword: "toner cartridge printer IT equipment",naics: "334118" },
  { division: "3",  keyword: "medical supplies surgical gloves",  naics: "339112" },
  { division: "4",  keyword: "food subsistence MRE rations",      naics: "311999" },
  { division: "5",  keyword: "janitorial cleaning supplies",      naics: "325612" },
  { division: "6",  keyword: "clothing uniforms tactical apparel",naics: "315190" },
  { division: "7",  keyword: "tools hardware industrial equipment",naics: "423710" },
  { division: "8",  keyword: "safety PPE hard hat protective",    naics: "339113" },
  { division: "9",  keyword: "communications radio two-way",      naics: "334220" },
  { division: "10", keyword: "logistics shipping warehouse",      naics: "493110" },
];

function dateFmt(d: Date): string {
  return `${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}/${d.getFullYear()}`;
}

function defaultRange() {
  const to   = new Date();
  const from = new Date(to); from.setDate(from.getDate() - 90);
  return { postedFrom: dateFmt(from), postedTo: dateFmt(to) };
}

async function fetchOpportunities(keyword: string, naics: string, limit = 5): Promise<any[]> {
  const key = process.env.SAM_GOV_API_KEY;
  if (!key) return [];
  const { postedFrom, postedTo } = defaultRange();
  const qs = new URLSearchParams({ limit: String(limit), offset: "0", postedFrom, postedTo, q: keyword, naicsCode: naics, api_key: key });
  try {
    const res  = await fetch(`${SAM_BASE}?${qs}`, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const json = await res.json() as any;
    return json.opportunitiesData ?? [];
  } catch { return []; }
}

export interface BridgeScanResult {
  division:   string;
  keyword:    string;
  naics:      string;
  found:      number;
  loaded:     number;
  skipped:    number;
}

export async function runSamBridge(): Promise<{ total: number; byDivision: BridgeScanResult[]; ranAt: string }> {
  const results: BridgeScanResult[] = [];
  let totalLoaded = 0;

  // Run all division searches in parallel
  const fetches = await Promise.allSettled(
    DIVISION_SEARCHES.map(async (search) => {
      const opps = await fetchOpportunities(search.keyword, search.naics, 5);
      let loaded = 0, skipped = 0;

      for (const o of opps) {
        const solNum = o.solicitationNumber ?? o.noticeId;
        if (!solNum) { skipped++; continue; }

        // Already in registry?
        if (registry.contracts[solNum]) { skipped++; continue; }

        // Map SAM.gov opportunity → registry contract format
        registry.contracts[solNum] = {
          contractId:    solNum,
          contractRef:   solNum,
          contractName:  o.title ?? "Untitled Opportunity",
          agency:        o.fullParentPathName ?? o.organizationHierarchy?.[0]?.name ?? "Unknown Agency",
          naics:         o.naicsCode ?? search.naics,
          totalValue:    o.award?.amount ? parseFloat(o.award.amount) : undefined,
          estimatedValue:o.award?.amount ? parseFloat(o.award.amount) : undefined,
          deadline:      o.responseDeadline ?? undefined,
          expiresAt:     o.responseDeadline ?? undefined,
          status:        "active",
          source:        "SAM.GOV",
          division:      search.division,
          postedDate:    o.postedDate ?? undefined,
          description:   (o.description ?? "").slice(0, 500),
          setAside:      o.typeOfSetAside ?? undefined,
          catalog:       [],
          products:      [],
        };
        loaded++;
        totalLoaded++;
      }

      return { division: search.division, keyword: search.keyword, naics: search.naics, found: opps.length, loaded, skipped };
    })
  );

  for (const r of fetches) {
    if (r.status === "fulfilled") results.push(r.value);
  }

  return { total: totalLoaded, byDivision: results, ranAt: new Date().toISOString() };
}
