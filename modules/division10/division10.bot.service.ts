// modules/division10/division10.bot.service.ts
// Division 10 — Operator Bot Service
//
// Identity:  Division 10 Operator Bot — Contract Intelligence
// Authority: Level 1 — Draft + Analysis Only
// Reports to: Architect (Eric Lucero)
//
// HARD RULES (enforced in code — never relaxed):
//  1. NEVER submit quotes, bids, or offers
//  2. NEVER contact agencies, COs, suppliers, or external entities
//  3. NEVER sign, agree, or commit the company to anything
//  4. ALWAYS escalate actionable items to the Architect
//  5. ALWAYS log every meaningful action as a relic
//  6. NEVER override governance, margin bands, or authority levels

import { randomUUID } from "crypto";
import { registry } from "../../src/core/engine";
import {
  BotOpportunity, BotRelic, BotAlert, BotCycleSummary, BotStatus,
  BotAnalysisReport, BotDraftQuote, BotQuoteLineItem, SupplierRec,
  OpportunityStatus, BotRelicType, AlertType, BotCLIN,
} from "./division10.bot.types";

// ── Constants ────────────────────────────────────────────────────────────────

const BOT_IDENTITY = {
  name:           "DIV10-BOT-001",
  division:       10 as const,
  title:          "Operator Bot" as const,
  reportsTo:      "Eric Lucero (Architect)",
  authorityLevel: 1 as const,
};

const MARGIN_BANDS = { low: 0.08, target: 0.18, premium: 0.27 };

// Division 10 scope: Logistics, Fleet, and all federal medical/supply categories
const DIVISION_10_NAICS = ["339113","336612","336510","336111","532120","541614","484110","484121","493110","488510"];
const DIVISION_10_PSC   = ["6515","6510","6520","6530","6545","2310","2320","2330","2340","5130","V119","V112"];

// Deadline warning windows (hours before deadline)
const DEADLINE_WINDOWS = { h72: 72, h48: 48, h24: 24 };

// ── In-memory state ──────────────────────────────────────────────────────────

const botState: {
  opportunities: Record<string, BotOpportunity>;
  relics:        BotRelic[];
  alerts:        BotAlert[];
  cycles:        BotCycleSummary[];
  status:        "ACTIVE" | "IDLE" | "SCANNING";
} = {
  opportunities: {},
  relics:        [],
  alerts:        [],
  cycles:        [],
  status:        "IDLE",
};

// ── Internal helpers ─────────────────────────────────────────────────────────

function emitRelic(
  type:    BotRelicType,
  entity:  string,
  meaning: string,
  oppId?:  string,
  metadata?: Record<string, any>,
): BotRelic {
  const relic: BotRelic = {
    relicId:   randomUUID(),
    type,
    source:    "bot",
    entity,
    meaning,
    oppId,
    metadata,
    timestamp: new Date().toISOString(),
  };
  botState.relics.push(relic);
  return relic;
}

function raiseAlert(
  level:          BotAlert["level"],
  type:           AlertType,
  message:        string,
  requiredAction: string,
  oppId?:         string,
): BotAlert {
  const alert: BotAlert = {
    alertId:        randomUUID(),
    level,
    type,
    message,
    oppId,
    requiredAction,
    escalatedTo:    BOT_IDENTITY.reportsTo,
    createdAt:      new Date().toISOString(),
    acknowledged:   false,
  };
  botState.alerts.push(alert);
  emitRelic("alert", oppId ?? "SYSTEM", message, oppId, { alertId: alert.alertId, level, type });
  return alert;
}

function hoursUntil(isoDate: string): number {
  return (new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60);
}

function isDiv10Scope(naics?: string, psc?: string): boolean {
  if (!naics && !psc) return true; // assume relevant if unspecified
  if (naics && DIVISION_10_NAICS.includes(naics)) return true;
  if (psc   && DIVISION_10_PSC.includes(psc))     return true;
  return false;
}

function bandFor(margin: number): BotDraftQuote["marginBand"] {
  if (margin >= MARGIN_BANDS.premium) return "PREMIUM";
  if (margin >= MARGIN_BANDS.target)  return "TARGET";
  if (margin >= MARGIN_BANDS.low)     return "LOW";
  return "BELOW_LOW";
}

// ── A. CONTRACT DISCOVERY ────────────────────────────────────────────────────

function discoverFromRegistry(): { discovered: number; existing: number } {
  const contracts = Object.values(registry.contracts) as any[];
  const bids      = Object.values(registry.bids ?? {})      as any[];

  let discovered = 0;
  let existing   = 0;

  // Scan Division 2 contracts
  contracts.forEach(c => {
    const solNum = c.contractRef ?? c.contractId;
    const alreadyKnown = Object.values(botState.opportunities)
      .some(o => o.solicitationNumber === solNum);

    if (alreadyKnown) { existing++; return; }

    if (!isDiv10Scope(c.naics, c.psc)) return;

    const clins: BotCLIN[] = (c.catalog ?? c.products ?? []).map((p: any, i: number) => ({
      clin:        p.clin ?? `CLIN-${String(i + 1).padStart(3, "0")}`,
      description: p.description ?? p.productName ?? p.sku ?? "TBD",
      quantity:    p.quantity ?? 1,
      unitPrice:   p.unitPrice ?? p.contractPrice ?? 0,
    }));

    const opp: BotOpportunity = {
      oppId:                   randomUUID(),
      solicitationNumber:      solNum,
      title:                   c.contractName ?? c.title ?? solNum,
      agency:                  c.agency ?? "Unknown Agency",
      naics:                   c.naics,
      psc:                     c.psc,
      setAside:                c.setAside,
      estimatedValue:          c.totalValue ?? c.estimatedValue,
      deadline:                c.expiresAt ?? c.deadline,
      status:                  "DISCOVERY",
      clins,
      supplierRecommendations: [],
      complianceRisks:         [],
      source:                  "REGISTRY",
      discoveredAt:            new Date().toISOString(),
      updatedAt:               new Date().toISOString(),
    };

    botState.opportunities[opp.oppId] = opp;
    discovered++;

    emitRelic("discovery", opp.agency, `New opportunity discovered: ${opp.title}`, opp.oppId, {
      solicitationNumber: opp.solicitationNumber,
      source:             "REGISTRY",
      clinCount:          clins.length,
    });

    raiseAlert(
      "INFO",
      "NEW_RFQ",
      `New contract opportunity discovered — ${opp.solicitationNumber}: ${opp.title}`,
      "Review opportunity and authorize analysis cycle. Escalate to Architect if scope aligns with Division 10 mission.",
      opp.oppId,
    );
  });

  // Scan Division 3 bids for submitted pipeline opportunities
  bids.forEach((b: any) => {
    if (!["SUBMITTED","UNDER_REVIEW"].includes(b.status)) return;

    const solNum = b.contractId ?? b.bidRef;
    const alreadyKnown = Object.values(botState.opportunities)
      .some(o => o.solicitationNumber === solNum || o.solicitationNumber === b.bidRef);
    if (alreadyKnown) { existing++; return; }

    const clins: BotCLIN[] = (b.lineItems ?? []).map((li: any) => ({
      clin:        li.clin ?? "TBD",
      description: li.description ?? li.sku,
      quantity:    li.quantity ?? 1,
      unitPrice:   li.unitPrice ?? 0,
    }));

    const opp: BotOpportunity = {
      oppId:                   randomUUID(),
      solicitationNumber:      b.bidRef,
      title:                   `Pipeline Bid — ${b.bidRef}`,
      agency:                  b.vendorName ?? "Unknown",
      estimatedValue:          b.totalValue,
      deadline:                b.submittedAt,
      status:                  "READY_FOR_ARCHITECT",
      clins,
      supplierRecommendations: [],
      complianceRisks:         [],
      source:                  "REGISTRY",
      notes:                   `Sourced from Division 3 bid pipeline. Bid status: ${b.status}`,
      discoveredAt:            new Date().toISOString(),
      updatedAt:               new Date().toISOString(),
    };

    botState.opportunities[opp.oppId] = opp;
    discovered++;

    emitRelic("discovery", opp.agency, `Pipeline bid detected: ${opp.solicitationNumber} — ${b.status}`, opp.oppId, {
      bidId: b.bidId, bidStatus: b.status,
    });
  });

  return { discovered, existing };
}

// ── B. CONTRACT ANALYSIS ─────────────────────────────────────────────────────

function analyzeOpportunity(oppId: string): BotAnalysisReport | { error: string } {
  const opp = botState.opportunities[oppId];
  if (!opp) return { error: "Opportunity not found" };

  const fitRationale: string[] = [];
  const complianceRisks: string[] = [];
  let fitScore = 50; // baseline

  // NAICS/PSC fit check
  if (opp.naics && DIVISION_10_NAICS.includes(opp.naics)) {
    fitScore += 15;
    fitRationale.push(`NAICS ${opp.naics} aligns with Division 10 supply categories.`);
  }
  if (opp.psc && DIVISION_10_PSC.includes(opp.psc)) {
    fitScore += 15;
    fitRationale.push(`PSC ${opp.psc} matches Division 10 product capability.`);
  }

  // CLIN coverage
  if (opp.clins.length >= 10) {
    fitScore += 10;
    fitRationale.push(`${opp.clins.length} CLINs present — broad catalog match opportunity.`);
  } else if (opp.clins.length > 0) {
    fitScore += 5;
    fitRationale.push(`${opp.clins.length} CLIN(s) identified.`);
  }

  // Existing inventory coverage
  const products = Object.values(registry.products) as any[];
  const skusInRegistry = new Set(products.map(p => p.sku));
  const clinSkus = opp.clins.map(c => c.clin);
  const coveredClins = clinSkus.filter(sku => skusInRegistry.has(sku)).length;
  if (coveredClins > 0) {
    fitScore += Math.min(coveredClins * 2, 10);
    fitRationale.push(`${coveredClins} CLIN(s) have matching SKUs in Division 1 catalog.`);
  }

  // Compliance risks
  if (!opp.naics) {
    complianceRisks.push("NAICS code not specified — verify eligibility before bid preparation.");
    fitScore -= 5;
  }
  if (!opp.setAside) {
    complianceRisks.push("Set-aside type not confirmed — check for small business requirements.");
  }
  if (opp.deadline) {
    const hrs = hoursUntil(opp.deadline);
    if (hrs < 0) {
      complianceRisks.push("DEADLINE PASSED — opportunity may be closed.");
      fitScore -= 20;
    } else if (hrs < 24) {
      complianceRisks.push("CRITICAL: Deadline within 24 hours. Immediate Architect escalation required.");
    } else if (hrs < 72) {
      complianceRisks.push(`WARNING: Deadline in ${hrs.toFixed(0)} hours. Prioritize review.`);
    }
  } else {
    complianceRisks.push("No deadline confirmed — verify solicitation for response due date.");
  }

  fitScore = Math.max(0, Math.min(100, fitScore));

  // Update opportunity
  opp.fitScore        = fitScore;
  opp.complianceRisks = complianceRisks;
  opp.status          = "ANALYSIS";
  opp.updatedAt       = new Date().toISOString();

  const recommendation =
    fitScore >= 75 ? "PURSUE — High fit. Authorize supplier matching and draft preparation." :
    fitScore >= 50 ? "EVALUATE — Moderate fit. Architect review recommended before committing resources." :
                     "MONITOR — Low fit. Track for information only; do not allocate resources without Architect direction.";

  opp.recommendation = recommendation;

  emitRelic("analysis", opp.agency, `Analysis complete for ${opp.solicitationNumber} — Fit Score: ${fitScore}/100`, oppId, {
    fitScore, complianceRisks: complianceRisks.length, recommendation,
  });

  const report: BotAnalysisReport = {
    oppId,
    opportunity:     opp,
    fitScore,
    fitRationale,
    complianceRisks,
    supplierMatch:   opp.supplierRecommendations,
    draftQuote:      opp.draftQuote,
    recommendation,
    nextSteps: [
      "Architect must review and approve before any response is prepared.",
      "Verify NAICS eligibility with legal/compliance.",
      `Run supplier matching to identify capable vendors (${opp.clins.length} CLINs).`,
      fitScore >= 75 ? "Authorize draft quote preparation." : "Monitor only — escalate if requirements evolve.",
    ],
    escalateToArchitect: fitScore >= 50,
    generatedAt: new Date().toISOString(),
  };

  if (report.escalateToArchitect) {
    raiseAlert(
      fitScore >= 75 ? "CRITICAL" : "WARN",
      "ESCALATION",
      `Opportunity ${opp.solicitationNumber} requires Architect review. Fit Score: ${fitScore}/100. ${recommendation}`,
      "Review analysis report and authorize next steps. Bot awaiting instruction.",
      oppId,
    );
  }

  return report;
}

// ── C. SUPPLIER MATCHING ─────────────────────────────────────────────────────

function matchSuppliers(oppId: string): SupplierRec[] | { error: string } {
  const opp = botState.opportunities[oppId];
  if (!opp) return { error: "Opportunity not found" };

  const vendors  = Object.values(registry.vendors  ?? {}) as any[];
  const products = Object.values(registry.products ?? {}) as any[];

  const clinCategories = new Set<string>();
  opp.clins.forEach(c => {
    const prod = products.find(p => p.sku === c.clin || p.clin === c.clin);
    if (prod?.category) clinCategories.add(prod.category);
  });

  const recs: SupplierRec[] = vendors
    .filter(v => v.status !== "INACTIVE")
    .map(v => {
      const vendorCats: string[] = v.categories ?? v.categoryFit ?? [];
      const overlap = vendorCats.filter(c => clinCategories.has(c)).length;
      const reliability = v.reliability ?? v.reliabilityScore ?? 70;
      const fitScore = Math.min(100, Math.round(reliability * 0.6 + overlap * 10));
      return {
        vendorId:   v.vendorId ?? v.id,
        vendorName: v.name ?? v.vendorName ?? "Unknown Vendor",
        fitScore,
        categories: vendorCats,
        rationale:  overlap > 0
          ? `Covers ${overlap} of ${clinCategories.size} required categories. Reliability: ${reliability}%.`
          : `No direct category match. Reliability: ${reliability}%. Evaluate for secondary sourcing.`,
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 5);

  // If no vendors in registry, flag it
  if (!recs.length) {
    raiseAlert(
      "WARN",
      "SUPPLIER_MISSING",
      `No vendors available in registry for opportunity ${opp.solicitationNumber}. Cannot complete supplier match.`,
      "Register capable vendors in Division 7 before authorizing draft preparation.",
      oppId,
    );
    opp.supplierRecommendations = [];
  } else {
    opp.supplierRecommendations = recs;
    opp.status    = "SUPPLIER_MATCHED";
    opp.updatedAt = new Date().toISOString();

    emitRelic("match", opp.agency, `Supplier match complete for ${opp.solicitationNumber} — ${recs.length} vendor(s) identified`, oppId, {
      topVendor: recs[0]?.vendorName, topScore: recs[0]?.fitScore, vendorCount: recs.length,
    });
  }

  return recs;
}

// ── D. QUOTE PREPARATION (DRAFT ONLY) ────────────────────────────────────────

function prepDraft(oppId: string): BotDraftQuote | { error: string } {
  const opp = botState.opportunities[oppId];
  if (!opp) return { error: "Opportunity not found" };

  // Authority check — bot NEVER submits, only prepares DRAFT
  const riskFlags: string[] = [
    "DRAFT ONLY — This quote has NOT been submitted. Architect review and explicit authorization required before any submission.",
    "Bot authority level 1 — no commitment authority. All figures are estimates pending Architect validation.",
  ];

  const assumptions: string[] = [
    `Margin basis: TARGET band (${(MARGIN_BANDS.target * 100).toFixed(0)}%) per Division 10 governance.`,
    "Unit prices estimated from Division 1 product catalog where available; otherwise flagged as TBD.",
    "Quantities set to contract minimums (1 unit per CLIN unless specified).",
    "Delivery: FOB Destination assumed. Confirm delivery terms with contracting officer (via Architect only).",
    "Set-aside eligibility not verified — Architect must confirm before submission.",
  ];

  const products = Object.values(registry.products) as any[];

  const lineItems: BotQuoteLineItem[] = opp.clins.map(clin => {
    const prod     = products.find(p => p.sku === clin.clin || p.clin === clin.clin);
    const cost     = prod?.cost ?? (clin.unitPrice ?? 0) * (1 - MARGIN_BANDS.target);
    const qty      = clin.quantity ?? 1;
    const rawPrice = clin.unitPrice && clin.unitPrice > 0
      ? clin.unitPrice                                    // use existing contract price
      : prod?.price ?? (cost / (1 - MARGIN_BANDS.target)); // derive from cost + target margin

    const extended  = rawPrice * qty;
    const margin    = rawPrice > 0 && cost > 0 ? (rawPrice - cost) / rawPrice : MARGIN_BANDS.target;
    const marginPct = `${(margin * 100).toFixed(1)}%`;

    if (!prod) {
      riskFlags.push(`CLIN ${clin.clin}: No matching SKU in Division 1 catalog — price is ESTIMATED. Verify before authorization.`);
    }
    if (margin < MARGIN_BANDS.low) {
      riskFlags.push(`CLIN ${clin.clin}: Estimated margin ${marginPct} is BELOW LOW BAND (${(MARGIN_BANDS.low * 100)}%). Flag for Architect.`);
    }

    return {
      clin:        clin.clin,
      description: clin.description,
      quantity:    qty,
      unitPrice:   Math.round(rawPrice * 100) / 100,
      extended:    Math.round(extended  * 100) / 100,
      marginPct,
    };
  });

  const totalEstimate = lineItems.reduce((s, li) => s + li.extended, 0);
  const avgMargin     = lineItems.length > 0
    ? lineItems.reduce((s, li) => s + parseFloat(li.marginPct) / 100, 0) / lineItems.length
    : MARGIN_BANDS.target;

  const draft: BotDraftQuote = {
    totalEstimate:  Math.round(totalEstimate * 100) / 100,
    margin:         Math.round(avgMargin * 10000) / 10000,
    marginBand:     bandFor(avgMargin),
    lineItems,
    assumptions,
    deliveryNotes:  "FOB Destination — confirm delivery location and lead time requirements with Architect before submission.",
    riskFlags,
    status:         "READY_FOR_ARCHITECT_REVIEW",
    preparedAt:     new Date().toISOString(),
  };

  opp.draftQuote = draft;
  opp.status     = "READY_FOR_ARCHITECT";
  opp.updatedAt  = new Date().toISOString();

  emitRelic("prep", opp.agency, `Draft quote prepared for ${opp.solicitationNumber} — $${totalEstimate.toFixed(2)} estimated. Status: READY FOR ARCHITECT REVIEW.`, oppId, {
    totalEstimate, marginBand: draft.marginBand, riskFlagCount: riskFlags.length, status: "DRAFT — NOT SUBMITTED",
  });

  raiseAlert(
    "CRITICAL",
    "ESCALATION",
    `Draft quote READY FOR REVIEW — ${opp.solicitationNumber}. Estimated value: $${totalEstimate.toFixed(2)}. ${riskFlags.length} risk flag(s). AWAITING ARCHITECT AUTHORIZATION.`,
    "Review draft quote line items, risk flags, and margin band. Authorize or reject submission. Bot cannot proceed without explicit Architect approval.",
    oppId,
  );

  return draft;
}

// ── E. DEADLINE ALERTING ─────────────────────────────────────────────────────

function checkDeadlines(): number {
  let alertsRaised = 0;

  Object.values(botState.opportunities).forEach(opp => {
    if (!opp.deadline) return;
    const hrs = hoursUntil(opp.deadline);

    if (hrs <= DEADLINE_WINDOWS.h24 && hrs > 0) {
      const existing = botState.alerts.find(
        a => a.oppId === opp.oppId && a.type === "DEADLINE_24H" && !a.acknowledged
      );
      if (!existing) {
        raiseAlert("CRITICAL", "DEADLINE_24H",
          `DEADLINE IN ${hrs.toFixed(1)} HOURS — ${opp.solicitationNumber}: ${opp.title}`,
          "IMMEDIATE Architect review required. Bot cannot submit. Architect must act now.",
          opp.oppId,
        );
        alertsRaised++;
      }
    } else if (hrs <= DEADLINE_WINDOWS.h48 && hrs > DEADLINE_WINDOWS.h24) {
      const existing = botState.alerts.find(
        a => a.oppId === opp.oppId && a.type === "DEADLINE_48H" && !a.acknowledged
      );
      if (!existing) {
        raiseAlert("WARN", "DEADLINE_48H",
          `Deadline in 48 hours — ${opp.solicitationNumber}: ${opp.title}`,
          "Architect review required within 24 hours. Ensure draft is prepared.",
          opp.oppId,
        );
        alertsRaised++;
      }
    } else if (hrs <= DEADLINE_WINDOWS.h72 && hrs > DEADLINE_WINDOWS.h48) {
      const existing = botState.alerts.find(
        a => a.oppId === opp.oppId && a.type === "DEADLINE_72H" && !a.acknowledged
      );
      if (!existing) {
        raiseAlert("INFO", "DEADLINE_72H",
          `Deadline in 72 hours — ${opp.solicitationNumber}: ${opp.title}`,
          "Verify draft preparation status. Escalate if incomplete.",
          opp.oppId,
        );
        alertsRaised++;
      }
    }
  });

  return alertsRaised;
}

// ── F. FULL CYCLE ────────────────────────────────────────────────────────────

function runCycle(): BotCycleSummary {
  botState.status = "SCANNING";
  const cycleStart  = botState.relics.length;
  const alertStart  = botState.alerts.length;
  const cycleId     = randomUUID();
  const escalations: string[] = [];

  // A. Discover
  const { discovered } = discoverFromRegistry();

  // B+C+D. Analyze all DISCOVERY-status opportunities
  const toAnalyze = Object.values(botState.opportunities)
    .filter(o => o.status === "DISCOVERY");

  toAnalyze.forEach(opp => {
    analyzeOpportunity(opp.oppId);
    matchSuppliers(opp.oppId);
    if ((opp.fitScore ?? 0) >= 50) {
      prepDraft(opp.oppId);
      escalations.push(`${opp.solicitationNumber} — Fit ${opp.fitScore}/100 — Draft READY FOR ARCHITECT`);
    }
  });

  // E. Deadline check on all known opportunities
  const deadlineAlerts = checkDeadlines();

  const relicsInCycle = botState.relics.length - cycleStart;
  const alertsInCycle = botState.alerts.length - alertStart;

  const summary: BotCycleSummary = {
    cycleId,
    ranAt:                   new Date().toISOString(),
    contractsScanned:        Object.keys(registry.contracts ?? {}).length,
    opportunitiesDiscovered: discovered,
    alertsRaised:            alertsInCycle,
    relicsCreated:           relicsInCycle,
    escalations,
    summary: escalations.length > 0
      ? `Cycle complete. ${discovered} new opportunities. ${escalations.length} item(s) escalated to Architect. ${deadlineAlerts} deadline alert(s). All drafts pending Architect authorization — bot has NOT submitted anything.`
      : `Cycle complete. ${discovered} new opportunities discovered. ${alertsInCycle} alert(s). No escalations required. System monitoring continues.`,
  };

  botState.cycles.push(summary);
  botState.status = "IDLE";

  emitRelic("alert", "SYSTEM", `Cycle ${cycleId.slice(0, 8)} complete — ${relicsInCycle} relics, ${alertsInCycle} alerts, ${escalations.length} escalations`, undefined, {
    cycleId, relicsCreated: relicsInCycle, alertsRaised: alertsInCycle, escalations,
  });

  return summary;
}

// ── Public API ────────────────────────────────────────────────────────────────

export const botService = {
  // Status
  getStatus(): BotStatus {
    return {
      identity:                  BOT_IDENTITY,
      mission:                   "Continuously scan, interpret, classify, and prepare federal contracting opportunities relevant to Division 10. Maintain perfect awareness of deadlines, amendments, supplier fit, and compliance requirements.",
      status:                    botState.status,
      lastCycleAt:               botState.cycles[botState.cycles.length - 1]?.ranAt,
      lastCycleSummary:          botState.cycles[botState.cycles.length - 1],
      totalRelicsCreated:        botState.relics.length,
      totalAlertsRaised:         botState.alerts.length,
      totalOpportunitiesTracked: Object.keys(botState.opportunities).length,
      hardRules: [
        "NEVER submit quotes, bids, offers, or responses.",
        "NEVER contact agencies, COs, suppliers, or external entities.",
        "NEVER sign, agree, or commit the company to anything.",
        "ALWAYS escalate actionable items to the Architect.",
        "ALWAYS log every action as a relic.",
        "ONLY operate inside Division 10 scope unless explicitly instructed otherwise.",
        "NEVER override governance, margin bands, or authority levels.",
      ],
      dataCanRead:  ["financials", "inventory", "operators", "contracts", "alerts", "reports"],
      dataCanWrite: ["draft contracts", "alerts", "relics", "recommendations"],
      generatedAt:  new Date().toISOString(),
    };
  },

  // Core behaviors
  runCycle,
  analyzeOpportunity,
  matchSuppliers,
  prepDraft,

  // Opportunity management
  listOpportunities(status?: OpportunityStatus): BotOpportunity[] {
    const all = Object.values(botState.opportunities);
    return status ? all.filter(o => o.status === status) : all;
  },

  getOpportunity(oppId: string): BotOpportunity | null {
    return botState.opportunities[oppId] ?? null;
  },

  ingestOpportunity(data: {
    solicitationNumber: string;
    title:              string;
    agency:             string;
    naics?:             string;
    psc?:               string;
    setAside?:          string;
    estimatedValue?:    number;
    deadline?:          string;
    notes?:             string;
    clins?:             BotCLIN[];
    source?:            BotOpportunity["source"];
  }): BotOpportunity {
    const opp: BotOpportunity = {
      oppId:                   randomUUID(),
      solicitationNumber:      data.solicitationNumber,
      title:                   data.title,
      agency:                  data.agency,
      naics:                   data.naics,
      psc:                     data.psc,
      setAside:                data.setAside,
      estimatedValue:          data.estimatedValue,
      deadline:                data.deadline,
      notes:                   data.notes,
      clins:                   data.clins ?? [],
      status:                  "DISCOVERY",
      supplierRecommendations: [],
      complianceRisks:         [],
      source:                  data.source ?? "MANUAL",
      discoveredAt:            new Date().toISOString(),
      updatedAt:               new Date().toISOString(),
    };

    botState.opportunities[opp.oppId] = opp;

    emitRelic("discovery", opp.agency, `Manual ingest: ${opp.solicitationNumber} — ${opp.title}`, opp.oppId, {
      solicitationNumber: opp.solicitationNumber, source: opp.source,
    });

    raiseAlert("INFO", "NEW_RFQ",
      `Opportunity manually ingested: ${opp.solicitationNumber}`,
      "Run analysis cycle to score and prepare draft. Escalate to Architect when ready.",
      opp.oppId,
    );

    return opp;
  },

  // Relics
  getRelics(type?: BotRelicType, oppId?: string, limit?: number): BotRelic[] {
    let relics = [...botState.relics].reverse();
    if (type)  relics = relics.filter(r => r.type  === type);
    if (oppId) relics = relics.filter(r => r.oppId === oppId);
    return limit ? relics.slice(0, limit) : relics;
  },

  // Alerts
  getAlerts(level?: BotAlert["level"], acknowledged?: boolean): BotAlert[] {
    let alerts = [...botState.alerts].reverse();
    if (level !== undefined)        alerts = alerts.filter(a => a.level === level);
    if (acknowledged !== undefined) alerts = alerts.filter(a => a.acknowledged === acknowledged);
    return alerts;
  },

  acknowledgeAlert(alertId: string): BotAlert | { error: string } {
    const alert = botState.alerts.find(a => a.alertId === alertId);
    if (!alert) return { error: "Alert not found" };
    alert.acknowledged = true;
    emitRelic("alert", "SYSTEM", `Alert acknowledged by Architect: ${alert.message.slice(0, 80)}`, alert.oppId, { alertId });
    return alert;
  },

  // Cycles
  getCycles(limit?: number): BotCycleSummary[] {
    const cycles = [...botState.cycles].reverse();
    return limit ? cycles.slice(0, limit) : cycles;
  },
};
