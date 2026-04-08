"use strict";
// modules/division10/division10.bot.service.ts
// Division 10 — Operator Bot Service (v2)
//
// System Prompt: DIVISION 10 OPERATOR BOT (rev 2)
// Identity:  DIV10-BOT-001 — Operator Bot — Division 10 (Logistics & Fleet Intelligence)
// Authority: Level 1 — Draft + Analysis Only
// Reports to: Architect (Eric Lucero)
//
// HARD RULES (enforced in code — immutable):
//  1. NEVER submit quotes, bids, offers, or responses
//  2. NEVER contact agencies, COs, suppliers, or external entities
//  3. NEVER sign, agree, or commit the company to anything
//  4. ALWAYS escalate actionable items to the Architect
//  5. ALWAYS log every meaningful action as a relic
//  6. OPERATE only within Division 10 unless explicitly instructed otherwise
//  7. NEVER override governance, margin bands, or authority levels
Object.defineProperty(exports, "__esModule", { value: true });
exports.botService = void 0;
const crypto_1 = require("crypto");
const engine_1 = require("../../src/core/engine");
const division2_service_1 = require("../division2/division2.service");
const division3_service_1 = require("../division3/division3.service");
// ── Constants ─────────────────────────────────────────────────────────────────
const BOT_IDENTITY = {
    name: "DIV10-BOT-001",
    division: 10,
    title: "Operator Bot",
    reportsTo: "Eric Lucero (Architect)",
    authorityLevel: 1,
};
const MARGIN_BANDS = { low: 0.08, target: 0.18, premium: 0.27 };
// Division 10 in-scope NAICS & PSC codes
const DIV10_NAICS = [
    "339113", "336612", "336510", "336111", "532120",
    "541614", "484110", "484121", "493110", "488510",
];
const DIV10_PSC = [
    "6515", "6510", "6520", "6530", "6545",
    "2310", "2320", "2330", "2340", "5130", "V119", "V112",
];
// Deadline windows (hours)
const DL = { h24: 24, h48: 48, h72: 72 };
// Alert logic table — spec-defined triggers + severity
const ALERT_LOGIC = {
    "new-opportunity": "Medium",
    "deadline-72h": "Medium",
    "deadline-48h": "High",
    "deadline-24h": "High",
    "amendment": "Medium",
    "supplier-issue": "Medium",
    "missing-info": "High",
    "high-variance-price": "Medium",
    "compliance-risk": "High",
    "fit-warning": "Medium",
    "escalation": "High",
    "system": "Low",
};
// Supplier scoring weights (spec)
const SUPPLIER_WEIGHTS = {
    reliability: 0.40,
    responseTime: 0.20,
    categoryFit: 0.20,
    inventoryAvailability: 0.10,
    pastPerformance: 0.10,
};
// ── In-memory state ───────────────────────────────────────────────────────────
const botState = {
    opportunities: {},
    relics: [],
    alerts: [],
    cycles: [],
    commandLog: [],
    loopStep: "AWAIT_ARCHITECT_APPROVAL",
    status: "IDLE",
};
// ── Relic emitter ─────────────────────────────────────────────────────────────
function emitRelic(type, entity, meaning, oppId, metadata) {
    const relic = {
        relicId: (0, crypto_1.randomUUID)(),
        type,
        source: "bot",
        entity,
        meaning,
        division: 10,
        oppId,
        metadata,
        timestamp: new Date().toISOString(),
    };
    botState.relics.push(relic);
    return relic;
}
// ── Alert raiser ──────────────────────────────────────────────────────────────
function raiseAlert(alertType, entity, message, recommendedAction, oppId) {
    const severity = ALERT_LOGIC[alertType];
    const alert = {
        alertId: (0, crypto_1.randomUUID)(),
        alertType,
        severity,
        entity,
        message,
        oppId,
        recommendedAction,
        escalatedTo: BOT_IDENTITY.reportsTo,
        timestamp: new Date().toISOString(),
        acknowledged: false,
    };
    botState.alerts.push(alert);
    // every alert is a relic
    emitRelic("alert", entity, `[${severity.toUpperCase()}][${alertType}] ${message.slice(0, 100)}`, oppId, {
        alertId: alert.alertId, alertType, severity,
    });
    return alert;
}
// ── Utilities ─────────────────────────────────────────────────────────────────
function hoursUntil(iso) {
    return (new Date(iso).getTime() - Date.now()) / 3600000;
}
function isInScope(naics, psc) {
    if (!naics && !psc)
        return true;
    if (naics && DIV10_NAICS.includes(naics))
        return true;
    if (psc && DIV10_PSC.includes(psc))
        return true;
    return false;
}
function fitBandFor(score) {
    if (score >= 0.80)
        return "strong";
    if (score >= 0.50)
        return "moderate";
    return "weak";
}
function marginBandFor(m) {
    if (m >= MARGIN_BANDS.premium)
        return "PREMIUM";
    if (m >= MARGIN_BANDS.target)
        return "TARGET";
    if (m >= MARGIN_BANDS.low)
        return "LOW";
    return "BELOW_LOW";
}
// ── STEP 1: DISCOVER ──────────────────────────────────────────────────────────
function stepDiscover() {
    botState.loopStep = "1_DISCOVER";
    const contracts = Object.values(engine_1.registry.contracts ?? {});
    const bids = Object.values(engine_1.registry.bids ?? {});
    let discovered = 0, alreadyKnown = 0;
    contracts.forEach(c => {
        const solNum = c.contractRef ?? c.contractId;
        const known = Object.values(botState.opportunities).some(o => o.solicitationNumber === solNum);
        if (known) {
            alreadyKnown++;
            return;
        }
        if (!isInScope(c.naics, c.psc))
            return;
        const clins = (c.catalog ?? c.products ?? []).map((p, i) => ({
            clin: p.clin ?? `CLIN-${String(i + 1).padStart(3, "0")}`,
            description: p.description ?? p.productName ?? p.sku ?? "",
            quantity: p.quantity ?? 1,
            unitPrice: p.unitPrice ?? p.contractPrice ?? 0,
            hasIssue: !p.description && !p.productName,
        }));
        const opp = {
            oppId: (0, crypto_1.randomUUID)(),
            solicitationNumber: solNum,
            title: c.contractName ?? c.title ?? solNum,
            agency: c.agency ?? "Unknown",
            naics: c.naics,
            psc: c.psc,
            setAside: c.setAside,
            estimatedValue: c.totalValue ?? c.estimatedValue,
            deadline: c.expiresAt ?? c.deadline,
            status: "DISCOVERY",
            clins,
            supplierRecommendations: [],
            complianceRisks: [],
            riskFlags: [],
            source: "REGISTRY",
            discoveredAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        botState.opportunities[opp.oppId] = opp;
        discovered++;
        emitRelic("discovery", opp.agency, `New opportunity discovered: ${opp.solicitationNumber} — ${opp.title}`, opp.oppId, { solNum: opp.solicitationNumber, naics: opp.naics, psc: opp.psc, clinCount: clins.length });
        raiseAlert("new-opportunity", opp.agency, `New contract discovered — ${opp.solicitationNumber}: ${opp.title}`, "Review opportunity and authorize analysis.", opp.oppId);
    });
    // Scan pipeline bids
    bids.forEach((b) => {
        if (!["SUBMITTED", "UNDER_REVIEW"].includes(b.status))
            return;
        const known = Object.values(botState.opportunities).some(o => o.solicitationNumber === b.bidRef);
        if (known) {
            alreadyKnown++;
            return;
        }
        const clins = (b.lineItems ?? []).map((li) => ({
            clin: li.clin ?? "TBD",
            description: li.description ?? li.sku,
            quantity: li.quantity ?? 1,
            unitPrice: li.unitPrice ?? 0,
        }));
        const opp = {
            oppId: (0, crypto_1.randomUUID)(),
            solicitationNumber: b.bidRef,
            title: `Pipeline Bid — ${b.bidRef}`,
            agency: b.vendorName ?? "Unknown",
            estimatedValue: b.totalValue,
            status: "DISCOVERY",
            clins,
            supplierRecommendations: [],
            complianceRisks: [],
            riskFlags: [],
            source: "REGISTRY",
            notes: `Sourced from Division 3 bid pipeline (${b.status}).`,
            discoveredAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        botState.opportunities[opp.oppId] = opp;
        discovered++;
        emitRelic("discovery", opp.agency, `Pipeline bid ingested: ${opp.solicitationNumber} — ${b.status}`, opp.oppId, { bidId: b.bidId, bidStatus: b.status });
    });
    return { discovered, alreadyKnown };
}
// ── STEP 2: CLASSIFY ──────────────────────────────────────────────────────────
function stepClassify(opp) {
    opp.status = "CLASSIFIED";
    opp.updatedAt = new Date().toISOString();
    emitRelic("analysis", opp.agency, `Classified: ${opp.solicitationNumber} — NAICS ${opp.naics ?? "?"} PSC ${opp.psc ?? "?"}`, opp.oppId, { naics: opp.naics, psc: opp.psc, source: opp.source });
}
// ── STEP 3: EXTRACT ───────────────────────────────────────────────────────────
function stepExtract(opp) {
    // Check missing-info: CLINs without descriptions
    const missingCLINs = opp.clins.filter(c => !c.description || c.description === c.clin);
    if (missingCLINs.length) {
        raiseAlert("missing-info", opp.agency, `${missingCLINs.length} CLIN(s) missing description in ${opp.solicitationNumber}: ${missingCLINs.map(c => c.clin).join(", ")}`, "Retrieve full solicitation document and populate CLIN details before analysis.", opp.oppId);
    }
    // Check missing set-aside
    if (!opp.setAside) {
        raiseAlert("compliance-risk", opp.agency, `Set-aside type not specified for ${opp.solicitationNumber}. Cannot verify eligibility.`, "Confirm set-aside status from solicitation. Required before any submission.", opp.oppId);
        opp.complianceRisks = [...(opp.complianceRisks ?? []),
            "Set-aside type not confirmed — verify eligibility before proceeding."];
    }
    opp.status = "EXTRACTED";
    opp.updatedAt = new Date().toISOString();
    emitRelic("analysis", opp.agency, `Extracted ${opp.clins.length} CLINs from ${opp.solicitationNumber}. ${missingCLINs.length} gap(s) flagged.`, opp.oppId, { clinCount: opp.clins.length, missingCLINs: missingCLINs.length });
}
// ── STEP 4: ANALYZE ───────────────────────────────────────────────────────────
function stepAnalyze(opp) {
    const products = Object.values(engine_1.registry.products ?? {});
    const fitRationale = [];
    const riskFlags = [];
    let raw = 0.50; // baseline
    // NAICS/PSC scope
    if (opp.naics && DIV10_NAICS.includes(opp.naics)) {
        raw += 0.15;
        fitRationale.push(`NAICS ${opp.naics} is in Division 10 scope.`);
    }
    if (opp.psc && DIV10_PSC.includes(opp.psc)) {
        raw += 0.10;
        fitRationale.push(`PSC ${opp.psc} matches Division 10 product capability.`);
    }
    // CLIN coverage against Division 1 catalog
    const catalogSkus = new Set(products.map(p => p.sku));
    const covered = opp.clins.filter(c => catalogSkus.has(c.clin)).length;
    if (opp.clins.length > 0) {
        const covRatio = covered / opp.clins.length;
        raw += covRatio * 0.15;
        fitRationale.push(`${covered}/${opp.clins.length} CLINs have Division 1 catalog matches (${(covRatio * 100).toFixed(0)}% coverage).`);
    }
    // CLIN breadth bonus
    if (opp.clins.length >= 10) {
        raw += 0.05;
        fitRationale.push(`${opp.clins.length}-CLIN opportunity — broad catalog alignment.`);
    }
    // Risk: price variance >30% within CLINs
    const prices = opp.clins.map(c => c.unitPrice ?? 0).filter(p => p > 0);
    if (prices.length >= 2) {
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const maxDev = Math.max(...prices.map(p => Math.abs(p - avg) / avg));
        if (maxDev > 0.30) {
            riskFlags.push(`Price variance across CLINs is ${(maxDev * 100).toFixed(0)}% — exceeds 30% threshold.`);
            raiseAlert("high-variance-price", opp.agency, `Price variance of ${(maxDev * 100).toFixed(0)}% detected in ${opp.solicitationNumber}. Review CLIN pricing before draft.`, "Architect to review pricing spread before authorizing submission.", opp.oppId);
            raw -= 0.05;
        }
    }
    // Deadline risks
    if (opp.deadline) {
        const hrs = hoursUntil(opp.deadline);
        if (hrs < 0) {
            riskFlags.push("DEADLINE PASSED — opportunity may be closed.");
            raw -= 0.20;
        }
        else if (hrs < DL.h24) {
            riskFlags.push(`CRITICAL: Deadline in ${hrs.toFixed(0)}h.`);
        }
        else if (hrs < DL.h72) {
            riskFlags.push(`Deadline in ${hrs.toFixed(0)}h — prioritize review.`);
        }
    }
    else {
        riskFlags.push("No deadline confirmed.");
    }
    // Missing set-aside lowers fit
    if (!opp.setAside) {
        raw -= 0.05;
        riskFlags.push("Set-aside type not confirmed — eligibility unverified.");
    }
    const fitScore = Math.max(0, Math.min(1.0, Math.round(raw * 100) / 100));
    const fitBand = fitBandFor(fitScore);
    // fit-warning alert for weak scores
    if (fitBand === "weak") {
        raiseAlert("fit-warning", opp.agency, `Fit score ${fitScore.toFixed(2)} (WEAK) for ${opp.solicitationNumber}. Low alignment with Division 10 scope.`, "Architect to decide whether to continue or close opportunity.", opp.oppId);
    }
    opp.fitScore = fitScore;
    opp.fitBand = fitBand;
    opp.fitRationale = fitRationale;
    opp.riskFlags = [...(opp.riskFlags ?? []), ...riskFlags];
    opp.status = "ANALYSIS";
    opp.updatedAt = new Date().toISOString();
    emitRelic("analysis", opp.agency, `Analysis complete — ${opp.solicitationNumber} | Fit: ${fitScore.toFixed(2)} (${fitBand.toUpperCase()})`, opp.oppId, { fitScore, fitBand, riskFlags: riskFlags.length, complianceRisks: opp.complianceRisks?.length });
}
// ── STEP 5: MATCH ─────────────────────────────────────────────────────────────
function stepMatch(opp) {
    const vendors = Object.values(engine_1.registry.vendors ?? {});
    const products = Object.values(engine_1.registry.products ?? {});
    const inventory = Object.values(engine_1.registry.inventory ?? {});
    // Derive required categories from CLINs
    const clinCategories = new Set();
    opp.clins.forEach(c => {
        const prod = products.find(p => p.sku === c.clin || p.clin === c.clin);
        if (prod?.category)
            clinCategories.add(prod.category);
    });
    const recs = vendors
        .filter(v => v.status !== "INACTIVE")
        .map(v => {
        const vendorCats = v.categories ?? v.categoryFit ?? [];
        const catOverlap = vendorCats.filter(c => clinCategories.has(c)).length;
        const catMax = Math.max(clinCategories.size, 1);
        // 5-factor weighted score (0–100 each factor)
        const reliability = Math.min(100, (v.reliability ?? v.reliabilityScore ?? 70));
        const responseScore = v.responseTime
            ? Math.max(0, 100 - (parseFloat(v.responseTime) ?? 5) * 10)
            : 60;
        const catScore = Math.round((catOverlap / catMax) * 100);
        const invItems = inventory.filter(i => vendorCats.some(cat => {
            const prod = products.find(p => (p.sku === (i.sku ?? i.productId)) && p.category === cat);
            return !!prod;
        })).length;
        const invScore = Math.min(100, invItems * 20);
        const pastPerf = v.pastPerformance ?? v.performanceScore ?? 65;
        const composite = Math.round(reliability * SUPPLIER_WEIGHTS.reliability +
            responseScore * SUPPLIER_WEIGHTS.responseTime +
            catScore * SUPPLIER_WEIGHTS.categoryFit +
            invScore * SUPPLIER_WEIGHTS.inventoryAvailability +
            pastPerf * SUPPLIER_WEIGHTS.pastPerformance);
        const tier = composite >= 80 ? "primary" : composite >= 60 ? "backup" : "not-recommended";
        // Flag unreliable vendors
        const relNorm = reliability / 100;
        if (relNorm < 0.75) {
            raiseAlert("supplier-issue", v.name ?? v.vendorName ?? "Unknown Vendor", `Vendor reliability ${(relNorm * 100).toFixed(0)}% is below 75% threshold for ${opp.solicitationNumber}.`, "Consider backup supplier. Notify Architect before allocating to primary.", opp.oppId);
        }
        const breakdown = {
            reliability,
            responseTime: responseScore,
            categoryFit: catScore,
            inventoryAvailability: invScore,
            pastPerformance: pastPerf,
            composite,
        };
        return {
            vendorId: v.vendorId ?? v.id,
            vendorName: v.name ?? v.vendorName ?? "Unknown",
            score: composite,
            tier,
            categories: vendorCats,
            rationale: `Composite ${composite}/100. Category overlap: ${catOverlap}/${catMax}. Reliability: ${reliability}%.`,
            riskNotes: relNorm < 0.75 ? `Reliability below threshold (${(relNorm * 100).toFixed(0)}%).` : "No issues detected.",
            scoreBreakdown: breakdown,
        };
    })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    if (!recs.length) {
        raiseAlert("supplier-issue", opp.agency, `No vendors registered for opportunity ${opp.solicitationNumber}. Supplier match incomplete.`, "Register capable vendors in Division 7 before draft preparation.", opp.oppId);
    }
    opp.supplierRecommendations = recs;
    opp.status = "SUPPLIER_MATCHED";
    opp.updatedAt = new Date().toISOString();
    emitRelic("match", opp.agency, `Supplier match complete — ${opp.solicitationNumber} | ${recs.length} vendor(s) | Top: ${recs[0]?.vendorName ?? "none"} (${recs[0]?.score ?? 0}/100, ${recs[0]?.tier ?? "-"})`, opp.oppId, { vendorCount: recs.length, topScore: recs[0]?.score, topVendor: recs[0]?.vendorName, topTier: recs[0]?.tier });
}
// ── STEP 6: DRAFT ─────────────────────────────────────────────────────────────
function stepDraft(opp) {
    const products = Object.values(engine_1.registry.products ?? {});
    const riskFlags = [
        "DRAFT ONLY — NOT SUBMITTED. Authority Level 1 — Architect authorization required before any action.",
        "Bot cannot commit the company to any offer, agreement, or submission.",
    ];
    const pricingAssumptions = [
        `Margin basis: TARGET band (${(MARGIN_BANDS.target * 100).toFixed(0)}%) per Division 10 governance.`,
        "Prices derived from Division 1 catalog where available; estimated otherwise.",
        "Quantities set to CLIN minimums unless specified.",
    ];
    const bom = [];
    const requiredDocuments = [
        "SAM.gov registration (active)",
        "Capability statement",
        "Price list (BPA CLINs)",
        "Set-aside certification (if applicable)",
        "Past performance references",
    ];
    const lineItems = opp.clins.map(clin => {
        const prod = products.find(p => p.sku === clin.clin || p.clin === clin.clin);
        const qty = clin.quantity ?? 1;
        const rawPrice = clin.unitPrice && clin.unitPrice > 0 ? clin.unitPrice
            : prod?.price && prod.price > 0 ? prod.price
                : 0;
        const cost = prod?.cost ?? rawPrice * (1 - MARGIN_BANDS.target);
        const margin = rawPrice > 0 && cost > 0 ? (rawPrice - cost) / rawPrice : MARGIN_BANDS.target;
        const marginPct = `${(margin * 100).toFixed(1)}%`;
        const extended = rawPrice * qty;
        const source = clin.unitPrice && clin.unitPrice > 0
            ? "contract" : prod?.price ? "catalog" : "estimated";
        bom.push(`${clin.clin}: ${clin.description} — Qty ${qty} × $${rawPrice.toFixed(2)} = $${extended.toFixed(2)}`);
        if (!prod) {
            riskFlags.push(`${clin.clin}: No Division 1 catalog match — price ESTIMATED.`);
            pricingAssumptions.push(`${clin.clin}: Unit price estimated at $${rawPrice.toFixed(2)} (no catalog data).`);
        }
        if (margin < MARGIN_BANDS.low) {
            riskFlags.push(`${clin.clin}: Margin ${marginPct} BELOW LOW BAND — Architect review required.`);
        }
        return {
            clin: clin.clin, description: clin.description,
            quantity: qty, unitPrice: Math.round(rawPrice * 100) / 100,
            extended: Math.round(extended * 100) / 100,
            marginPct, priceSource: source,
        };
    });
    const totalEstimate = lineItems.reduce((s, li) => s + li.extended, 0);
    const avgMargin = lineItems.length > 0
        ? lineItems.reduce((s, li) => s + parseFloat(li.marginPct) / 100, 0) / lineItems.length
        : MARGIN_BANDS.target;
    const draft = {
        totalEstimate: Math.round(totalEstimate * 100) / 100,
        margin: Math.round(avgMargin * 10000) / 10000,
        marginBand: marginBandFor(avgMargin),
        lineItems,
        bom,
        assumptions: [
            `FOB Destination assumed. Confirm with Architect.`,
            `Period of performance: as stated in solicitation.`,
        ],
        pricingAssumptions,
        deliveryNotes: "FOB Destination — delivery terms and lead time to be confirmed by Architect with contracting officer.",
        riskFlags,
        requiredDocuments,
        status: "READY_FOR_ARCHITECT_REVIEW",
        preparedAt: new Date().toISOString(),
    };
    opp.draftQuote = draft;
    opp.status = "READY_FOR_ARCHITECT";
    opp.updatedAt = new Date().toISOString();
    emitRelic("prep", opp.agency, `Draft prepared — ${opp.solicitationNumber} | $${totalEstimate.toFixed(2)} | ${draft.marginBand} margin | READY_FOR_ARCHITECT_REVIEW`, opp.oppId, { totalEstimate, marginBand: draft.marginBand, riskFlagCount: riskFlags.length, clinCount: lineItems.length });
    return draft;
}
// ── STEP 7: ALERT (DEADLINE CHECK) ───────────────────────────────────────────
function stepAlert() {
    let raised = 0;
    Object.values(botState.opportunities).forEach(opp => {
        // Skip paused, archived, or closed opportunities — no deadline alerts
        if (["HOLD", "DECLINED", "CLOSED"].includes(opp.status))
            return;
        if (!opp.deadline)
            return;
        const hrs = hoursUntil(opp.deadline);
        const entity = opp.agency;
        const exists = (t) => botState.alerts.some(a => a.oppId === opp.oppId && a.alertType === t && !a.acknowledged);
        if (hrs > 0 && hrs <= DL.h24 && !exists("deadline-24h")) {
            raiseAlert("deadline-24h", entity, `DEADLINE IN ${hrs.toFixed(1)}h — ${opp.solicitationNumber}: ${opp.title}`, "IMMEDIATE Architect action required. Bot cannot submit.", opp.oppId);
            raised++;
        }
        else if (hrs > DL.h24 && hrs <= DL.h48 && !exists("deadline-48h")) {
            raiseAlert("deadline-48h", entity, `Deadline in ${hrs.toFixed(0)}h — ${opp.solicitationNumber}: ${opp.title}`, "Architect review required. Ensure draft is prepared and approved.", opp.oppId);
            raised++;
        }
        else if (hrs > DL.h48 && hrs <= DL.h72 && !exists("deadline-72h")) {
            raiseAlert("deadline-72h", entity, `Deadline in ${hrs.toFixed(0)}h — ${opp.solicitationNumber}: ${opp.title}`, "Verify draft preparation status. Escalate if incomplete.", opp.oppId);
            raised++;
        }
    });
    return raised;
}
// ── STEP 8: RECOMMEND ────────────────────────────────────────────────────────
function stepRecommend(opp) {
    const fitScore = opp.fitScore ?? 0;
    const fitBand = opp.fitBand ?? "weak";
    const topSupplier = opp.supplierRecommendations[0];
    const suppScore = topSupplier?.score ?? 0;
    const draft = opp.draftQuote;
    const deadline = opp.deadline ? `${hoursUntil(opp.deadline).toFixed(0)}h remaining` : "No deadline set";
    let decision;
    let rationale;
    if (fitBand === "strong" && suppScore >= 60) {
        decision = "PURSUE";
        rationale = `Strong fit (${fitScore.toFixed(2)}) with capable supplier (${topSupplier?.vendorName ?? "TBD"}, score ${suppScore}). Recommend Architect authorization.`;
    }
    else if (fitBand === "moderate") {
        decision = "EVALUATE";
        rationale = `Moderate fit (${fitScore.toFixed(2)}). ${suppScore >= 60 ? "Supplier available." : "Supplier coverage weak."} Architect evaluation required before committing resources.`;
    }
    else {
        decision = "DO_NOT_PURSUE";
        rationale = `Weak fit (${fitScore.toFixed(2)}) and/or insufficient supplier coverage (${suppScore}). Recommend monitoring only.`;
    }
    const riskMitigationSteps = [];
    if (opp.complianceRisks?.length) {
        riskMitigationSteps.push("Resolve compliance risks before submission — set-aside and eligibility must be confirmed.");
    }
    if (opp.riskFlags?.some(f => f.includes("variance"))) {
        riskMitigationSteps.push("Review CLIN pricing spread. Normalize outlier prices before Architect review.");
    }
    if (opp.riskFlags?.some(f => f.toLowerCase().includes("deadline"))) {
        riskMitigationSteps.push("Prioritize deadline — escalate immediately if <48h remain.");
    }
    if (!topSupplier || topSupplier.tier === "not-recommended") {
        riskMitigationSteps.push("No primary supplier available. Register qualified vendors in Division 7.");
    }
    const rec = {
        pursue: decision === "PURSUE",
        decision,
        rationale,
        recommendedSupplier: topSupplier?.vendorName,
        marginBand: draft?.marginBand ?? "TARGET",
        requiredDocuments: draft?.requiredDocuments ?? ["SAM.gov registration", "Capability statement", "Price list"],
        riskMitigationSteps,
        deadlineReminder: deadline,
        generatedAt: new Date().toISOString(),
    };
    opp.recommendation = rec;
    opp.updatedAt = new Date().toISOString();
    emitRelic("recommendation", opp.agency, `Recommendation: ${decision} — ${opp.solicitationNumber} | Fit ${fitScore.toFixed(2)} (${fitBand}) | Supplier ${suppScore}/100`, opp.oppId, { decision, fitScore, fitBand, suppScore, marginBand: rec.marginBand });
    return rec;
}
// ── STEP 9: LOG (already handled by emitRelic throughout) ─────────────────────
// ── STEP 10: AWAIT ARCHITECT APPROVAL ────────────────────────────────────────
function stepEscalate(opp) {
    const rec = opp.recommendation;
    if (!rec || rec.decision === "DO_NOT_PURSUE")
        return;
    opp.status = "ESCALATED";
    opp.updatedAt = new Date().toISOString();
    raiseAlert("escalation", opp.agency, `${rec.decision} — ${opp.solicitationNumber} is READY FOR ARCHITECT REVIEW. Fit ${(opp.fitScore ?? 0).toFixed(2)} (${opp.fitBand}). Estimated value: $${opp.draftQuote?.totalEstimate?.toFixed(2) ?? "TBD"}. Deadline: ${rec.deadlineReminder}.`, `Architect must review analysis, supplier match, and draft quote. Bot awaits explicit authorization. NO SUBMISSION HAS BEEN MADE.`, opp.oppId);
    emitRelic("alert", opp.agency, `Step 10 — AWAITING ARCHITECT APPROVAL: ${opp.solicitationNumber} | ${rec.decision} | $${opp.draftQuote?.totalEstimate?.toFixed(2) ?? "TBD"}`, opp.oppId, { step: 10, decision: rec.decision, awaitingApproval: true });
}
// ── FULL 10-STEP CYCLE ────────────────────────────────────────────────────────
function runCycle(cycleType = "manual") {
    botState.status = "SCANNING";
    botState.loopStep = "1_DISCOVER";
    const relicStart = botState.relics.length;
    const alertStart = botState.alerts.length;
    const cycleId = (0, crypto_1.randomUUID)();
    const escalations = [];
    // Step 1
    const { discovered } = stepDiscover();
    // Steps 2–10 for newly-discovered opportunities only — never touch HOLD, DECLINED, CLOSED
    const toProcess = Object.values(botState.opportunities)
        .filter(o => ["DISCOVERY", "CLASSIFIED", "EXTRACTED"].includes(o.status));
    toProcess.forEach(opp => {
        botState.loopStep = "2_CLASSIFY";
        stepClassify(opp);
        botState.loopStep = "3_EXTRACT";
        stepExtract(opp);
        botState.loopStep = "4_ANALYZE";
        stepAnalyze(opp);
        botState.loopStep = "5_MATCH";
        stepMatch(opp);
        if ((opp.fitScore ?? 0) >= 0.50) {
            botState.loopStep = "6_DRAFT";
            stepDraft(opp);
        }
        botState.loopStep = "7_ALERT";
        // deadline check happens globally below
        botState.loopStep = "8_RECOMMEND";
        stepRecommend(opp);
        // Step 9: already logged via relics throughout
        botState.loopStep = "10_AWAIT_ARCHITECT_APPROVAL";
        stepEscalate(opp);
        if (opp.recommendation?.decision !== "DO_NOT_PURSUE") {
            escalations.push(`${opp.solicitationNumber} — ${opp.recommendation?.decision ?? "?"} — Fit ${(opp.fitScore ?? 0).toFixed(2)}`);
        }
    });
    // Step 7 — global deadline alerts
    botState.loopStep = "7_ALERT";
    const deadlineAlerts = stepAlert();
    const relicsInCycle = botState.relics.length - relicStart;
    const alertsInCycle = botState.alerts.length - alertStart;
    const summary = {
        cycleId,
        cycleType,
        ranAt: new Date().toISOString(),
        contractsScanned: Object.keys(engine_1.registry.contracts ?? {}).length,
        opportunitiesDiscovered: discovered,
        alertsRaised: alertsInCycle,
        relicsCreated: relicsInCycle,
        escalations,
        summary: escalations.length
            ? `Cycle [${cycleType}] complete. ${discovered} discovered. ${escalations.length} escalation(s) awaiting Architect. ${deadlineAlerts} deadline alert(s). Bot has NOT submitted anything.`
            : `Cycle [${cycleType}] complete. ${discovered} discovered. ${alertsInCycle} alert(s). No escalations. Monitoring continues.`,
    };
    botState.cycles.push(summary);
    botState.loopStep = "10_AWAIT_ARCHITECT_APPROVAL";
    botState.status = "IDLE";
    emitRelic("alert", "SYSTEM", `Cycle ${cycleId.slice(0, 8)} [${cycleType}] — ${relicsInCycle} relics | ${alertsInCycle} alerts | ${escalations.length} escalations`, undefined, { cycleId, cycleType, relicsCreated: relicsInCycle, alertsRaised: alertsInCycle, escalations });
    return summary;
}
// ── DAILY INTELLIGENCE SUMMARY ────────────────────────────────────────────────
function buildDailySummary() {
    const opps = Object.values(botState.opportunities);
    const open = opps.filter(o => !["CLOSED", "ESCALATED"].includes(o.status)).length;
    const ready = opps.filter(o => o.status === "READY_FOR_ARCHITECT" || o.status === "ESCALATED").length;
    const critical = botState.alerts.filter(a => a.severity === "High" && !a.acknowledged).length;
    const now = new Date();
    const soon = opps
        .filter(o => o.deadline && hoursUntil(o.deadline) > 0 && hoursUntil(o.deadline) <= 168)
        .map(o => ({
        solNum: o.solicitationNumber,
        deadline: o.deadline,
        hoursRemaining: Math.round(hoursUntil(o.deadline)),
    }))
        .sort((a, b) => a.hoursRemaining - b.hoursRemaining);
    // Inventory volatility check
    const inventory = Object.values(engine_1.registry.inventory ?? {});
    const outOrCrit = inventory.filter(i => {
        const q = i.quantity ?? i.qty ?? 0;
        return q === 0 || q <= 2;
    }).length;
    const recs = [];
    if (ready > 0)
        recs.push(`${ready} opportunity(ies) awaiting Architect review.`);
    if (critical > 0)
        recs.push(`${critical} unacknowledged high-severity alert(s) require attention.`);
    if (soon.length)
        recs.push(`${soon.length} deadline(s) within 7 days — prioritize review.`);
    emitRelic("recommendation", "SYSTEM", `Daily intelligence summary — ${open} open | ${ready} ready | ${critical} critical alerts`, undefined, { open, ready, critical, upcomingDeadlines: soon.length });
    return {
        date: now.toISOString().split("T")[0],
        openOpportunities: open,
        readyForArchitect: ready,
        criticalAlerts: critical,
        upcomingDeadlines: soon,
        inventoryVolatilityFlag: outOrCrit > 0,
        agencyTrustNotes: ["Agency trust data requires Division 8 records — populate for full intelligence."],
        recommendations: recs,
        generatedAt: now.toISOString(),
    };
}
// ── WEEKLY REPORT ─────────────────────────────────────────────────────────────
function buildWeeklyReport() {
    const opps = Object.values(botState.opportunities);
    const relics = botState.relics;
    const alerts = botState.alerts;
    const pursued = opps.filter(o => o.recommendation?.pursue).length;
    const rejected = opps.filter(o => o.recommendation?.decision === "DO_NOT_PURSUE").length;
    const relicTypeCounts = new Map();
    relics.forEach(r => relicTypeCounts.set(r.type, (relicTypeCounts.get(r.type) ?? 0) + 1));
    const relicPatterns = Array.from(relicTypeCounts.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);
    const alertTypeCounts = new Map();
    alerts.forEach(a => alertTypeCounts.set(a.alertType, (alertTypeCounts.get(a.alertType) ?? 0) + 1));
    const topAlertTypes = Array.from(alertTypeCounts.entries())
        .map(([alertType, count]) => ({ alertType, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    const vendors = Object.values(engine_1.registry.vendors ?? {});
    const supplierReliability = vendors.map(v => ({
        vendorName: v.name ?? v.vendorName ?? v.vendorId ?? "Unknown",
        score: v.reliability ?? 70,
        trend: "STABLE",
    }));
    // Category performance from Division 1 products
    const products = Object.values(engine_1.registry.products ?? {});
    const catMap = new Map();
    opps.forEach(o => {
        const cats = new Set();
        o.clins.forEach(c => {
            const prod = products.find(p => p.sku === c.clin || p.clin === c.clin);
            if (prod?.category)
                cats.add(prod.category);
        });
        cats.forEach(cat => {
            if (!catMap.has(cat))
                catMap.set(cat, { count: 0, scores: [] });
            catMap.get(cat).count++;
            if (o.fitScore)
                catMap.get(cat).scores.push(o.fitScore);
        });
    });
    const categoryPerformance = Array.from(catMap.entries()).map(([category, v]) => ({
        category,
        opportunityCount: v.count,
        avgFitScore: v.scores.length ? Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length * 100) / 100 : 0,
    }));
    const report = {
        weekEnding: new Date().toISOString().split("T")[0],
        totalOpportunities: opps.length,
        pursuedCount: pursued,
        rejectedCount: rejected,
        totalRelicsGenerated: relics.length,
        relicPatterns,
        supplierReliability,
        categoryPerformance,
        topAlertTypes,
        summary: `Weekly report: ${opps.length} total opportunities tracked. ${pursued} pursued, ${rejected} rejected. ${relics.length} relics generated. ${alerts.filter(a => !a.acknowledged).length} unacknowledged alerts.`,
        generatedAt: new Date().toISOString(),
    };
    emitRelic("recommendation", "SYSTEM", `Weekly Division 10 report — ${opps.length} opps | ${relics.length} relics | ${pursued} pursued`, undefined, { totalOpportunities: opps.length, pursuedCount: pursued, totalRelics: relics.length });
    return report;
}
// ── ARCHITECT COMMAND LAYER ───────────────────────────────────────────────────
// Authority: Eric Lucero (Architect) — only entity permitted to commit the
// company to any contractual action.  Bot enforces these boundaries in code.
const ARCHITECT_AUTHORITY_MANIFEST = {
    architect: "Eric Lucero",
    division: 10,
    exclusiveActions: [
        "Approve submissions to agencies or contracting officers",
        "Override risk flags",
        "Change margin bands outside governance",
        "Modify governance policy",
        "Add or remove Division 10 operators",
        "Activate new divisions",
        "Authorize any external communication",
    ],
    botCannotDo: [
        "Submit quotes, bids, offers, or responses",
        "Contact agencies, COs, suppliers, or external entities",
        "Sign, agree, or commit the company to anything",
        "Override governance, margin bands, or authority levels",
        "Interpret ambiguous language as approval",
        "Proceed without explicit Architect command",
    ],
    commandProtocol: [
        { command: "Proceed", effect: "Bot moves to next draft stage only.", botAction: "Advance status to DRAFT_PREP or prepare final draft package — NO submission." },
        { command: "Hold", effect: "Bot pauses all actions on this item.", botAction: "Set status to HOLD. No analysis, drafting, or alerting until further command." },
        { command: "Decline", effect: "Bot archives the opportunity.", botAction: "Set status to DECLINED. Log relic. Take no further action." },
        { command: "Revise", effect: "Bot re-analyzes and updates the draft.", botAction: "Set status to REVISING. Re-run steps 4–8. Generate updated escalation packet." },
        { command: "More info", effect: "Bot provides deeper analysis.", botAction: "Run deeper CLIN extraction, supplier deep-dive, compliance check. Emit risk relics. Re-escalate." },
    ],
    interactionRules: [
        "Bot must escalate any actionable item requiring approval.",
        "Bot must present information clearly, concisely, and without emotion.",
        "Bot must never assume approval.",
        "Bot must wait for explicit Architect confirmation before proceeding.",
        "Bot must provide recommended actions, not decisions.",
        "Bot must summarize risks in every escalation.",
        "Bot must timestamp all escalations and log them as relics.",
    ],
    toneAndConduct: [
        "Precise",
        "Concise",
        "Respectful",
        "Operational",
        "Free of emotion or speculation",
        "No persuasive language — facts, risks, and recommendations only",
    ],
};
// ── Uncertainty detection ─────────────────────────────────────────────────────
function detectUncertainty(opp) {
    const flags = [];
    if (!opp.setAside || opp.complianceRisks?.length)
        flags.push("compliance");
    const topSupplier = opp.supplierRecommendations[0];
    if (!topSupplier || topSupplier.tier === "not-recommended")
        flags.push("supplier-fit");
    const prices = opp.clins.map(c => c.unitPrice ?? 0).filter(p => p > 0);
    if (prices.length >= 2) {
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const maxDev = Math.max(...prices.map(p => Math.abs(p - avg) / avg));
        if (maxDev > 0.30)
            flags.push("pricing-variance");
    }
    const missingDesc = opp.clins.filter(c => !c.description || c.description.trim() === c.clin);
    if (missingDesc.length)
        flags.push("missing-data");
    if (opp.riskFlags?.some(f => f.toLowerCase().includes("ambiguous") ||
        f.toLowerCase().includes("unclear") ||
        f.toLowerCase().includes("unspecified")))
        flags.push("ambiguous-requirements");
    if (opp.deadline) {
        const hrs = hoursUntil(opp.deadline);
        if (hrs > 0 && hrs < 48)
            flags.push("delivery-feasibility");
    }
    return flags;
}
// ── Escalation packet builder ─────────────────────────────────────────────────
function buildEscalationPacket(oppId) {
    const opp = botState.opportunities[oppId];
    if (!opp)
        return { error: "Opportunity not found" };
    const fitScore = opp.fitScore ?? 0;
    const fitBand = opp.fitBand ?? "weak";
    const topSupplier = opp.supplierRecommendations[0] ?? null;
    const rec = opp.recommendation;
    const draft = opp.draftQuote;
    const uncertainty = detectUncertainty(opp);
    const isUncertain = uncertainty.length > 0;
    const hrs = opp.deadline ? hoursUntil(opp.deadline) : null;
    const deadlineStr = opp.deadline
        ? `${opp.deadline} (${hrs !== null && hrs > 0 ? hrs.toFixed(0) + "h remaining" : "PAST"})`
        : "No deadline set";
    // Risk bullet list
    const risks = [...(opp.complianceRisks ?? []), ...(opp.riskFlags ?? [])];
    if (isUncertain) {
        uncertainty.forEach(u => risks.push(`Risk: Uncertain — ${u.replace(/-/g, " ")}`));
    }
    if (!topSupplier) {
        risks.push("No vendors registered — supplier match incomplete.");
    }
    // Subject line
    const actionTag = rec?.decision === "PURSUE" ? "Authorization Required"
        : rec?.decision === "EVALUATE" ? "Architect Evaluation Required"
            : "Review Required";
    const subject = `RFQ — ${opp.solicitationNumber} — ${actionTag}`;
    // 2–3 sentence summary (facts only, no persuasion)
    const summary = [
        `Solicitation ${opp.solicitationNumber} (${opp.title}) from ${opp.agency} has been processed through the 10-step intelligence loop.`,
        `Fit score: ${fitScore.toFixed(2)} (${fitBand}). Estimated value: $${(opp.estimatedValue ?? draft?.totalEstimate ?? 0).toFixed(2)}.`,
        isUncertain
            ? `Uncertainty flags detected in: ${uncertainty.join(", ")}. Escalation includes Risk: Uncertain designations.`
            : `No uncertainty flags. ${draft ? `Draft prepared at ${draft.marginBand} margin.` : "Draft not prepared (fit below threshold)."}`,
    ].join(" ");
    // Recommended action (factual, no persuasion per spec)
    const recommendedAction = rec
        ? `Bot recommends ${rec.decision}. ${rec.riskMitigationSteps[0] ?? "Review analysis and issue command to proceed."}`
        : "Analysis incomplete. Issue 'More info' command or trigger analysis before deciding.";
    // Relic for this escalation
    const relic = emitRelic("alert", opp.agency, `ESCALATION — ${subject} | Fit ${fitScore.toFixed(2)} (${fitBand})${isUncertain ? " | UNCERTAIN" : ""}`, opp.oppId, { escalationSubject: subject, fitScore, fitBand, uncertainty, awaitingCommand: true });
    const packet = {
        escalationId: (0, crypto_1.randomUUID)(),
        oppId,
        issuedAt: new Date().toISOString(),
        subject,
        summary,
        fitScore,
        fitBand,
        supplierRecommendation: topSupplier
            ? { name: topSupplier.vendorName, score: topSupplier.score, tier: topSupplier.tier }
            : null,
        risks,
        uncertaintyFlags: uncertainty,
        deadline: deadlineStr,
        hoursRemaining: hrs !== null ? Math.round(hrs) : null,
        recommendedAction,
        status: draft ? "prepared — awaiting Architect command" : "analysis-only — draft not prepared",
        relicId: relic.relicId,
        architectAuthority: ARCHITECT_AUTHORITY_MANIFEST.exclusiveActions,
        commandsAccepted: ["Proceed", "Hold", "Decline", "Revise", "More info"],
        awaitingCommand: true,
    };
    return packet;
}
// ── Architect command processor ───────────────────────────────────────────────
const VALID_COMMANDS = new Set(["Proceed", "Hold", "Decline", "Revise", "More info"]);
// ── Auto-Pipeline Builder ─────────────────────────────────────────────────────
// Called on "Proceed" — creates a real Division 2 contract + Division 3 bid
// from the bot's extracted CLINs, pricing, and supplier match. The Architect
// just needs to review the bid and hit submit. Nothing is submitted automatically.
async function buildPipeline(opp) {
    try {
        // 1. Create the Division 2 contract from opportunity metadata
        const contract = await division2_service_1.division2Service.createContract({
            contractName: opp.title,
            agency: opp.agency,
            naics: opp.naics,
            contractRef: opp.solicitationNumber,
            periodOfPerformance: opp.deadline ? `Deadline: ${opp.deadline}` : "TBD",
            status: "active",
        });
        // 2. Add each CLIN — use draftQuote pricing if available, fall back to raw CLIN data
        const draftItems = opp.draftQuote?.lineItems ?? [];
        for (const clin of opp.clins) {
            const priced = draftItems.find(li => li.clin === clin.clin);
            await division2_service_1.division2Service.addProductToContract(contract.contractId, {
                sku: clin.clin,
                clin: clin.clin,
                contractPrice: priced?.unitPrice ?? clin.unitPrice ?? 0,
                notes: clin.description,
            });
        }
        // 3. Identify the top-scoring vendor from supplier recommendations
        const topSupplier = opp.supplierRecommendations.find(s => s.tier === "primary")
            ?? opp.supplierRecommendations[0];
        const vendorId = topSupplier?.vendorId ?? "BOT-VENDOR-PENDING";
        const vendorName = topSupplier?.vendorName ?? "Vendor Assignment Pending";
        // 4. Create the Division 3 bid with priced line items — status DRAFT, nothing submitted
        const lineItems = opp.clins.map(clin => {
            const priced = draftItems.find(li => li.clin === clin.clin);
            return {
                sku: clin.clin,
                clin: clin.clin,
                description: clin.description,
                quantity: clin.quantity ?? 1,
                unitPrice: priced?.unitPrice ?? clin.unitPrice ?? 0,
            };
        });
        const bid = await division3_service_1.division3Service.createBid({
            contractId: contract.contractId,
            vendorId,
            vendorName,
            lineItems,
            notes: `Auto-generated by DIV10-BOT-001 — PROCEED command on ${opp.solicitationNumber}. ` +
                `Fit score: ${opp.fitScore?.toFixed(2) ?? "N/A"}. ` +
                `Total estimate: $${opp.draftQuote?.totalEstimate?.toFixed(2) ?? "TBD"}. ` +
                `DRAFT ONLY — Architect review required before submission. NO external action taken.`,
        });
        if ("error" in bid)
            return { error: bid.error };
        return { contractId: contract.contractId, bidId: bid.bidId ?? "", bidRef: bid.bidRef ?? "" };
    }
    catch (err) {
        return { error: `Pipeline build failed: ${err?.message ?? String(err)}` };
    }
}
async function issueArchitectCommand(oppId, command, notes) {
    const opp = botState.opportunities[oppId];
    if (!opp)
        return { error: "Opportunity not found" };
    if (!VALID_COMMANDS.has(command)) {
        return { error: `Invalid command. Accepted: ${[...VALID_COMMANDS].join(", ")}. Ambiguous language is not accepted as approval.` };
    }
    // HOLD / DECLINED statuses block further commands (except explicit override with notes)
    if (opp.status === "DECLINED") {
        return { error: "Opportunity is DECLINED and archived. No further commands accepted." };
    }
    const prevStatus = opp.status;
    let newStatus = prevStatus;
    let botResponse;
    switch (command) {
        case "Proceed": {
            newStatus = "DRAFT_PREP";
            if (!opp.draftQuote)
                stepDraft(opp);
            opp.status = newStatus;
            opp.updatedAt = new Date().toISOString();
            // Auto-build the real pipeline: contract + CLINs + bid in the DB
            const pipeline = await buildPipeline(opp);
            if ("error" in pipeline) {
                botResponse = `Command received: PROCEED. Draft package ready. NOTE: Auto-pipeline creation encountered an issue: ${pipeline.error}. Create the contract and bid manually in Division 2/3.`;
            }
            else {
                opp.pipelineRef = { ...pipeline, createdAt: new Date().toISOString() };
                botResponse = `Command received: PROCEED. Pipeline auto-built. Contract ${pipeline.contractId} created in Division 2. Bid ${pipeline.bidRef} (${pipeline.bidId}) created in Division 3 — status DRAFT. Review pricing and hit submit when ready. NO submission has been made. Awaiting Architect authorization.`;
            }
            raiseAlert("escalation", opp.agency, `PROCEED — ${opp.solicitationNumber} pipeline ready. Bid ${opp.pipelineRef?.bidRef ?? "pending"} awaiting Architect review and submission authorization.`, `Review bid ${opp.pipelineRef?.bidId ?? "N/A"} at GET /division/3/bids/{id} then POST /division/3/bids/{id}/submit when ready.`, opp.oppId);
            break;
        }
        case "Hold":
            newStatus = "HOLD";
            botResponse = `Command received: HOLD. All analysis, drafting, and alerting for ${opp.solicitationNumber} is now PAUSED. No action will be taken until a subsequent command is issued by the Architect.`;
            opp.status = newStatus;
            opp.updatedAt = new Date().toISOString();
            // Acknowledge open alerts for this opp
            botState.alerts
                .filter(a => a.oppId === oppId && !a.acknowledged)
                .forEach(a => { a.acknowledged = true; });
            break;
        case "Decline":
            newStatus = "DECLINED";
            botResponse = `Command received: DECLINE. Opportunity ${opp.solicitationNumber} has been archived. No further analysis, drafting, or escalation will occur. Relic logged.`;
            opp.status = newStatus;
            opp.updatedAt = new Date().toISOString();
            break;
        case "Revise": {
            botResponse = `Command received: REVISE. Re-running analysis steps 4–8 for ${opp.solicitationNumber}. Updated draft and escalation packet will be generated.`;
            opp.status = "ANALYSIS";
            opp.updatedAt = new Date().toISOString();
            stepAnalyze(opp);
            stepMatch(opp);
            if ((opp.fitScore ?? 0) >= 0.50)
                stepDraft(opp);
            stepRecommend(opp);
            stepEscalate(opp);
            // Capture final status after all steps (stepEscalate may set ESCALATED)
            newStatus = opp.status;
            break;
        }
        case "More info": {
            botResponse = `Command received: MORE INFO. Running deeper extraction, compliance check, and supplier deep-dive for ${opp.solicitationNumber}. Risk relics will be generated. Updated escalation issued.`;
            stepClassify(opp);
            stepExtract(opp);
            stepAnalyze(opp);
            stepMatch(opp);
            const moreInfoUncertainty = detectUncertainty(opp);
            moreInfoUncertainty.forEach(u => emitRelic("risk", opp.agency, `Risk: Uncertain [${u}] — ${opp.solicitationNumber}. Deeper review required before Architect decision.`, opp.oppId, { uncertaintyCategory: u }));
            stepRecommend(opp);
            stepEscalate(opp);
            // Capture final status after all steps
            newStatus = opp.status;
            break;
        }
    }
    const relic = emitRelic("update", BOT_IDENTITY.reportsTo, `Architect command [${command}] issued for ${opp.solicitationNumber}. ${prevStatus} → ${newStatus}. ${notes ?? ""}`.trim(), opp.oppId, { command, prevStatus, newStatus, notes, issuedBy: "Eric Lucero (Architect)" });
    const log = {
        commandId: (0, crypto_1.randomUUID)(),
        oppId,
        command,
        notes,
        issuedBy: "Eric Lucero (Architect)",
        issuedAt: new Date().toISOString(),
        prevStatus,
        newStatus,
        botResponse,
        relicId: relic.relicId,
    };
    botState.commandLog.push(log);
    return log;
}
// ── Analyze a single opportunity (all steps 2–10) ────────────────────────────
function analyzeOpportunity(oppId) {
    const opp = botState.opportunities[oppId];
    if (!opp)
        return { error: "Opportunity not found" };
    stepClassify(opp);
    stepExtract(opp);
    stepAnalyze(opp);
    stepMatch(opp);
    if ((opp.fitScore ?? 0) >= 0.50)
        stepDraft(opp);
    const rec = stepRecommend(opp);
    stepEscalate(opp);
    return {
        oppId,
        opportunity: opp,
        fitScore: opp.fitScore ?? 0,
        fitBand: opp.fitBand ?? "weak",
        fitRationale: opp.fitRationale ?? [],
        complianceRisks: opp.complianceRisks ?? [],
        riskFlags: opp.riskFlags ?? [],
        supplierMatch: opp.supplierRecommendations,
        draftQuote: opp.draftQuote,
        recommendation: rec,
        nextSteps: [
            rec.decision === "PURSUE"
                ? "Architect authorization required — review draft and approve/reject."
                : rec.decision === "EVALUATE"
                    ? "Architect evaluation needed — review fit score and risk flags."
                    : "Monitor only — close if scope does not improve.",
            ...rec.riskMitigationSteps.slice(0, 3),
        ],
        escalateToArchitect: rec.pursue,
        loopStep: botState.loopStep,
        generatedAt: new Date().toISOString(),
    };
}
function matchSuppliers(oppId) {
    const opp = botState.opportunities[oppId];
    if (!opp)
        return { error: "Opportunity not found" };
    stepMatch(opp);
    return opp.supplierRecommendations;
}
function prepDraft(oppId) {
    const opp = botState.opportunities[oppId];
    if (!opp)
        return { error: "Opportunity not found" };
    return stepDraft(opp);
}
// ── Public API ────────────────────────────────────────────────────────────────
exports.botService = {
    getStatus() {
        const last = botState.cycles[botState.cycles.length - 1];
        return {
            identity: BOT_IDENTITY,
            mission: "Continuously scan, interpret, classify, and prepare federal contracting opportunities relevant to Division 10. Maintain perfect awareness of deadlines, amendments, supplier fit, and compliance requirements. Generate relics for every meaningful action. Always escalate final decisions.",
            status: botState.status,
            loopStep: botState.loopStep,
            lastCycleAt: last?.ranAt,
            lastCycleSummary: last,
            totalRelicsCreated: botState.relics.length,
            totalAlertsRaised: botState.alerts.length,
            totalOpportunitiesTracked: Object.keys(botState.opportunities).length,
            hardRules: [
                "Never submit quotes, bids, offers, or responses.",
                "Never contact agencies, COs, suppliers, or external entities.",
                "Never sign, agree, or commit the company to anything.",
                "Always escalate actionable items to the Architect.",
                "Always log every action as a relic.",
                "Operate only within Division 10 unless explicitly instructed otherwise.",
                "Never override governance, margin bands, or authority levels.",
            ],
            dataCanRead: ["financials", "inventory", "operators", "contracts", "alerts", "reports"],
            dataCanWrite: ["draft contracts", "alerts", "relics", "recommendations"],
            alertLogic: ALERT_LOGIC,
            generatedAt: new Date().toISOString(),
        };
    },
    runCycle,
    analyzeOpportunity,
    matchSuppliers,
    prepDraft,
    listOpportunities(status) {
        const all = Object.values(botState.opportunities);
        return status ? all.filter(o => o.status === status) : all;
    },
    getOpportunity(oppId) {
        return botState.opportunities[oppId] ?? null;
    },
    ingestOpportunity(data) {
        const opp = {
            oppId: (0, crypto_1.randomUUID)(),
            solicitationNumber: data.solicitationNumber,
            title: data.title,
            agency: data.agency,
            naics: data.naics,
            psc: data.psc,
            setAside: data.setAside,
            deliveryLocation: data.deliveryLocation,
            estimatedValue: data.estimatedValue,
            deadline: data.deadline,
            notes: data.notes,
            clins: data.clins ?? [],
            status: "DISCOVERY",
            supplierRecommendations: [],
            complianceRisks: [],
            riskFlags: [],
            source: data.source ?? "MANUAL",
            discoveredAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        botState.opportunities[opp.oppId] = opp;
        emitRelic("discovery", opp.agency, `Manual ingest: ${opp.solicitationNumber} — ${opp.title}`, opp.oppId, { solNum: opp.solicitationNumber, source: opp.source });
        raiseAlert("new-opportunity", opp.agency, `Opportunity ingested: ${opp.solicitationNumber} — ${opp.title}`, "Authorize analysis cycle. Escalate to Architect when ready.", opp.oppId);
        return opp;
    },
    getRelics(type, oppId, limit) {
        let r = [...botState.relics].reverse();
        if (type)
            r = r.filter(x => x.type === type);
        if (oppId)
            r = r.filter(x => x.oppId === oppId);
        return limit ? r.slice(0, limit) : r;
    },
    getAlerts(level, acknowledged) {
        let a = [...botState.alerts].reverse();
        if (level !== undefined)
            a = a.filter(x => x.severity === level);
        if (acknowledged !== undefined)
            a = a.filter(x => x.acknowledged === acknowledged);
        return a;
    },
    acknowledgeAlert(alertId) {
        const alert = botState.alerts.find(a => a.alertId === alertId);
        if (!alert)
            return { error: "Alert not found" };
        alert.acknowledged = true;
        emitRelic("update", "SYSTEM", `Alert acknowledged by Architect: [${alert.alertType}] ${alert.message.slice(0, 80)}`, alert.oppId, { alertId, alertType: alert.alertType });
        return alert;
    },
    getCycles(limit) {
        const c = [...botState.cycles].reverse();
        return limit ? c.slice(0, limit) : c;
    },
    getDailySummary: buildDailySummary,
    getWeeklyReport: buildWeeklyReport,
    // ── Architect Command Layer ──────────────────────────────────────────────
    buildEscalationPacket,
    issueArchitectCommand,
    getCommandLog(oppId) {
        const log = [...botState.commandLog].reverse();
        return oppId ? log.filter(l => l.oppId === oppId) : log;
    },
    getArchitectAuthority() {
        return { ...ARCHITECT_AUTHORITY_MANIFEST, generatedAt: new Date().toISOString() };
    },
};
//# sourceMappingURL=division10.bot.service.js.map