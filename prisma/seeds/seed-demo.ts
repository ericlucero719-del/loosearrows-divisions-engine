// prisma/seeds/seed-demo.ts
// LooseArrows Supply & Logistics™ — Demo Data Seed
// Populates a realistic government procurement pipeline with contracts, bids,
// POs, shipments, invoices, commerce orders, and SAM watchlist entries.
// Safe to re-run — upserts where possible, skips existing records.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function refId(prefix: string, n: number | string) {
  return `${prefix}-2026-${String(n).padStart(4, "0")}`;
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function pastDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

// ─── Scenario Data ────────────────────────────────────────────────────────────

const CONTRACTS = [
  {
    contractRef: refId("LA-CON", 1),
    contractName: "DLA Food Service Supply — FY2026 Q3",
    agency: "Defense Logistics Agency (DLA)",
    naics: "311999",
    psc: "8915",
    setAside: "SDVOSB",
    periodOfPerformance: "2026-07-01 to 2026-09-30",
    status: "active",
  },
  {
    contractRef: refId("LA-CON", 2),
    contractName: "GSA Schedule 75 — Office Supplies BPA",
    agency: "General Services Administration (GSA)",
    naics: "424120",
    psc: "7510",
    setAside: "8(a)",
    periodOfPerformance: "2026-04-01 to 2026-12-31",
    status: "active",
  },
  {
    contractRef: refId("LA-CON", 3),
    contractName: "VA Medical Center — PPE & Protective Gear",
    agency: "Dept of Veterans Affairs (VA)",
    naics: "339113",
    psc: "6515",
    setAside: "WOSB",
    periodOfPerformance: "2026-06-01 to 2026-11-30",
    status: "awarded",
  },
  {
    contractRef: refId("LA-CON", 4),
    contractName: "Army MICC — Uniform & Apparel IDIQ",
    agency: "Dept of Army — MICC",
    naics: "315190",
    psc: "8405",
    setAside: "HUBZone",
    periodOfPerformance: "2026-05-15 to 2027-05-14",
    status: "active",
  },
  {
    contractRef: refId("LA-CON", 5),
    contractName: "DHS Emergency Supplies — MRE & Field Rations",
    agency: "Dept of Homeland Security (DHS)",
    naics: "311999",
    psc: "8970",
    setAside: "SB",
    periodOfPerformance: "2026-08-01 to 2027-01-31",
    status: "draft",
  },
  {
    contractRef: refId("LA-CON", 6),
    contractName: "Air Force AFICA — IT Peripherals & Electronics",
    agency: "Dept of Air Force — AFICA",
    naics: "334118",
    psc: "7025",
    setAside: "SB",
    periodOfPerformance: "2026-04-15 to 2026-10-14",
    status: "active",
  },
];

// ─── BIDS (one per contract for demo realism) ─────────────────────────────────

const BID_CONFIGS = [
  { idx: 0, status: "AWARDED",   totalValue: 284_750, vendorName: "3M Government Markets",         notes: "Awarded FY26 Q3 — DLA pre-positioned" },
  { idx: 1, status: "SUBMITTED", totalValue: 128_400, vendorName: "Grainger Government Sales",      notes: "GSA Schedule BPA — awaiting CO approval" },
  { idx: 2, status: "AWARDED",   totalValue: 413_800, vendorName: "Cardinal Health — Gov Division", notes: "VA PPE award confirmed — PO issued" },
  { idx: 3, status: "AWARDED",   totalValue: 897_000, vendorName: "Propper International",          notes: "Army uniform IDIQ — initial delivery order" },
  { idx: 4, status: "DRAFT",     totalValue: 156_000, vendorName: "FEMA Logistics Partner LLC",     notes: "Pending DHS solicitation close date" },
  { idx: 5, status: "SUBMITTED", totalValue: 72_350,  vendorName: "CDW-G Government",               notes: "Air Force IT peripherals — quote sent to CO" },
];

// ─── PO CONFIGS ────────────────────────────────────────────────────────────────

const PO_CONFIGS = [
  { ref: refId("LA-PO", 1),  bidIdx: 0, vendorName: "3M Government Markets",         agencyName: "DLA",   status: "DELIVERED",     totalValue: 284_750 },
  { ref: refId("LA-PO", 2),  bidIdx: 2, vendorName: "Cardinal Health — Gov Division", agencyName: "VA",    status: "IN_TRANSIT",    totalValue: 213_800 },
  { ref: refId("LA-PO", 3),  bidIdx: 2, vendorName: "Cardinal Health — Gov Division", agencyName: "VA",    status: "OPEN",          totalValue: 200_000 },
  { ref: refId("LA-PO", 4),  bidIdx: 3, vendorName: "Propper International",          agencyName: "Army",  status: "IN_TRANSIT",    totalValue: 447_500 },
  { ref: refId("LA-PO", 5),  bidIdx: 3, vendorName: "Propper International",          agencyName: "Army",  status: "OPEN",          totalValue: 449_500 },
  { ref: refId("LA-PO", 6),  bidIdx: 5, vendorName: "CDW-G Government",               agencyName: "USAF",  status: "OPEN",          totalValue: 72_350  },
];

// ─── SHIPMENT CONFIGS ─────────────────────────────────────────────────────────

const SHIP_CONFIGS = [
  { ref: refId("LA-SHP", 1), poIdx: 0, vendorName: "3M Government Markets",         carrier: "FedEx Freight", tracking: "FX9420123456001", location: "Defense Distribution Center, Susquehanna PA", status: "DELIVERED", daysEta: -3  },
  { ref: refId("LA-SHP", 2), poIdx: 1, vendorName: "Cardinal Health — Gov Division", carrier: "UPS Freight",   tracking: "1Z8W92340340923456",  location: "VA Medical Center, Minneapolis MN",            status: "IN_TRANSIT", daysEta: 4  },
  { ref: refId("LA-SHP", 3), poIdx: 3, vendorName: "Propper International",          carrier: "XPO Logistics", tracking: "XPO-2026-8873421",    location: "Fort Cavazos, TX",                            status: "IN_TRANSIT", daysEta: 7  },
];

// ─── INVOICE CONFIGS ──────────────────────────────────────────────────────────

const INV_CONFIGS = [
  { ref: refId("LA-INV", 1), poIdx: 0, vendorName: "3M Government Markets",         agencyName: "DLA",  status: "PAID",    totalAmount: 284_750, paidAmount: 284_750, dueDate: daysFromNow(-10) },
  { ref: refId("LA-INV", 2), poIdx: 1, vendorName: "Cardinal Health — Gov Division", agencyName: "VA",   status: "PENDING", totalAmount: 213_800, paidAmount: 0,       dueDate: daysFromNow(15)  },
  { ref: refId("LA-INV", 3), poIdx: 3, vendorName: "Propper International",          agencyName: "Army", status: "PENDING", totalAmount: 447_500, paidAmount: 0,       dueDate: daysFromNow(22)  },
];

// ─── COMMERCE ORDERS ──────────────────────────────────────────────────────────

const COMMERCE_CONFIGS = [
  { platform: "SHOPIFY",   externalId: "SHO-5812939001",  status: "FULFILLED",  profitUsd: 4_820.50,  feeRate: 0.0075, channel: "web",        notes: "Shopify — bulk MRE pack order, corporate account" },
  { platform: "SHOPIFY",   externalId: "SHO-5813041002",  status: "PROCESSING", profitUsd: 1_240.00,  feeRate: 0.0075, channel: "web",        notes: "Shopify — uniform accessories, individual buyer" },
  { platform: "INSTAGRAM", externalId: "IG-20260408-001", status: "RECEIVED",   profitUsd: 890.00,    feeRate: 0.0075, channel: "instagram",   notes: "Instagram Shop — canteen + field gear bundle" },
  { platform: "AMAZON",    externalId: "AMZ-113-8293041", status: "FULFILLED",  profitUsd: 12_300.00, feeRate: 0.0075, channel: "amazon-fba",  notes: "Amazon — office supplies bulk, government buyer" },
  { platform: "AMAZON",    externalId: "AMZ-113-9201183", status: "SHIPPED",    profitUsd: 3_450.00,  feeRate: 0.0075, channel: "amazon-fba",  notes: "Amazon — PPE resale, healthcare facility" },
  { platform: "YOUTUBE",   externalId: "YT-20260408-001", status: "RECEIVED",   profitUsd: 620.00,    feeRate: 0.0075, channel: "youtube",     notes: "YouTube Shop — branded merchandise drop" },
  { platform: "SHOPIFY",   externalId: "SHO-5814209003",  status: "PENDING_PO", profitUsd: 7_185.00,  feeRate: 0.0075, channel: "web",         notes: "Shopify — emergency supply kit, school district" },
];

// ─── SAM WATCHLIST ────────────────────────────────────────────────────────────

const SAM_WATCHLIST = [
  {
    noticeId: "DEMO-SPE300-26-R-1028",
    title:    "DLA Troop Support — Food & Beverage, Northeast Region FY2027",
    agency:   "Defense Logistics Agency — DLA Troop Support",
    naicsCode: "311999",
    setAside:  "SDVOSB",
    awardAmount: 2_500_000,
    responseDeadline: daysFromNow(28),
    postedDate:       daysFromNow(-14),
    status:    "WATCHING",
    notes:     "High-priority — matches our DLA SDVOSB positioning. Prime opportunity for FY27.",
  },
  {
    noticeId: "DEMO-FA301026R0087",
    title:    "Air Force Materiel Command — IT Hardware & Peripherals BPA",
    agency:   "Dept of Air Force — AFMC",
    naicsCode: "334118",
    setAside:  "SB",
    awardAmount: 850_000,
    responseDeadline: daysFromNow(12),
    postedDate:       daysFromNow(-21),
    status:    "BIDDING",
    notes:     "Quote submitted to CDW-G as prime. LA as sub. Monitoring CO response.",
  },
  {
    noticeId: "DEMO-36C26P25R0012",
    title:    "VA National Acquisition Center — Medical/Surgical PPE IDIQ",
    agency:   "Dept of Veterans Affairs — National Acquisition Center",
    naicsCode: "339113",
    setAside:  "WOSB",
    awardAmount: 5_000_000,
    responseDeadline: daysFromNow(45),
    postedDate:       daysFromNow(-7),
    status:    "WATCHING",
    notes:     "Large IDIQ — aligned with existing VA PPE contract. Research capabilities match.",
  },
  {
    noticeId: "DEMO-W912DQ26Q0041",
    title:    "Army Corps of Engineers — Field Equipment & Safety Gear",
    agency:   "Dept of Army — USACE",
    naicsCode: "339113",
    setAside:  "HUBZone",
    awardAmount: 320_000,
    responseDeadline: daysFromNow(9),
    postedDate:       daysFromNow(-30),
    status:    "BIDDING",
    notes:     "Deadline approaching. Working quote with Propper and 3M. Urgent review needed.",
  },
  {
    noticeId: "DEMO-HSCG2326Q80001",
    title:    "DHS Coast Guard — Emergency Survival Kits, Coastal Stations",
    agency:   "Dept of Homeland Security — US Coast Guard",
    naicsCode: "311999",
    setAside:  "SB",
    awardAmount: 780_000,
    responseDeadline: daysFromNow(60),
    postedDate:       daysFromNow(-3),
    status:    "WATCHING",
    notes:     "New opportunity — aligns with DHS MRE pipeline. Early monitoring phase.",
  },
  {
    noticeId: "DEMO-GS35F119DA-001",
    title:    "GSA MAS Schedule 75 — Renewal & Modification for Office Supplies",
    agency:   "General Services Administration",
    naicsCode: "424120",
    setAside:  "SB",
    awardAmount: 450_000,
    responseDeadline: daysFromNow(20),
    postedDate:       daysFromNow(-10),
    status:    "WON",
    notes:     "GSA Schedule renewal confirmed. Modification approved. Active through Dec 2026.",
  },
];

// ─── SEED ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀  Seeding DEMO data — Loose Arrows Divisions Engine\n");

  // ── Contracts ──────────────────────────────────────────────────────────────
  const contractIds: string[] = [];
  let cCount = 0;
  for (const c of CONTRACTS) {
    const existing = await (prisma as any).govContract.findFirst({ where: { contractRef: c.contractRef } });
    if (existing) { contractIds.push(existing.contractId); continue; }
    const created = await (prisma as any).govContract.create({
      data: { ...c },
    });
    contractIds.push(created.contractId);
    cCount++;
  }
  console.log(`  ✔  Contracts: ${cCount} new (${CONTRACTS.length - cCount} already existed)`);

  // ── Bids / Quotes ──────────────────────────────────────────────────────────
  const bidIds: string[] = [];
  let bCount = 0;
  for (let i = 0; i < BID_CONFIGS.length; i++) {
    const bc = BID_CONFIGS[i];
    const cid = contractIds[bc.idx];
    const existing = await (prisma as any).govBid.findFirst({
      where: { contractId: cid, vendorName: bc.vendorName },
    });
    if (existing) { bidIds.push(existing.bidId); continue; }
    const created = await (prisma as any).govBid.create({
      data: {
        bidRef:     refId("LA-BID", i + 1),
        contractId: cid,
        vendorId:   `demo-vendor-${i + 1}`,
        vendorName: bc.vendorName,
        status:     bc.status,
        totalValue: bc.totalValue,
        notes:      bc.notes,
        submittedAt: bc.status !== "DRAFT" ? pastDate(10 + i * 3) : null,
        awardedAt:   bc.status === "AWARDED" ? pastDate(2 + i) : null,
      },
    });
    bidIds.push(created.bidId);
    bCount++;
  }
  console.log(`  ✔  Bids/Quotes: ${bCount} new`);

  // ── POs ────────────────────────────────────────────────────────────────────
  const poIds: string[] = [];
  let poCount = 0;
  for (let i = 0; i < PO_CONFIGS.length; i++) {
    const pc = PO_CONFIGS[i];
    const existing = await (prisma as any).govPO.findFirst({ where: { poRef: pc.ref } });
    if (existing) { poIds.push(existing.poId); continue; }
    const bid = bidIds[pc.bidIdx];
    const created = await (prisma as any).govPO.create({
      data: {
        poRef:      pc.ref,
        bidId:      bid,
        vendorName: pc.vendorName,
        agencyName: pc.agencyName,
        status:     pc.status,
        totalValue: pc.totalValue,
      },
    });
    // Add line items for realism
    const lineItemTemplates = [
      { sku: `DEMO-SKU-${i+1}A`, clin: `000${i+1}`, description: "Primary Line Item", quantity: Math.floor(pc.totalValue / 3 / 100), unitPrice: 100, extended: pc.totalValue * 0.6 },
      { sku: `DEMO-SKU-${i+1}B`, clin: `000${i+2}`, description: "Secondary Item",    quantity: Math.floor(pc.totalValue / 6 / 50),  unitPrice: 50,  extended: pc.totalValue * 0.25 },
      { sku: `DEMO-SKU-${i+1}C`, clin: `000${i+3}`, description: "Ancillary Supplies", quantity: Math.floor(pc.totalValue / 12 / 25), unitPrice: 25,  extended: pc.totalValue * 0.15 },
    ];
    for (const li of lineItemTemplates) {
      await (prisma as any).govPOLineItem.create({
        data: { poId: created.poId, ...li },
      });
    }
    poIds.push(created.poId);
    poCount++;
  }
  console.log(`  ✔  Purchase Orders: ${poCount} new (with line items)`);

  // ── Shipments ──────────────────────────────────────────────────────────────
  let shpCount = 0;
  for (const sc of SHIP_CONFIGS) {
    const existing = await (prisma as any).govShipment.findFirst({ where: { shipRef: sc.ref } });
    if (existing) continue;
    await (prisma as any).govShipment.create({
      data: {
        shipRef:          sc.ref,
        poId:             poIds[sc.poIdx] ?? null,
        vendorName:       sc.vendorName,
        carrier:          sc.carrier,
        trackingNumber:   sc.tracking,
        deliveryLocation: sc.location,
        expectedDelivery: daysFromNow(sc.daysEta),
        deliveredAt:      sc.daysEta < 0 ? daysFromNow(sc.daysEta) : null,
        status:           sc.status,
        notes:            `Auto-seeded demo shipment`,
      },
    });
    shpCount++;
  }
  console.log(`  ✔  Shipments: ${shpCount} new`);

  // ── Invoices ──────────────────────────────────────────────────────────────
  let invCount = 0;
  for (let i = 0; i < INV_CONFIGS.length; i++) {
    const ic = INV_CONFIGS[i];
    const existing = await (prisma as any).govInvoice.findFirst({ where: { invoiceRef: ic.ref } });
    if (existing) continue;
    const poId = poIds[ic.poIdx] ?? null;
    await (prisma as any).govInvoice.create({
      data: {
        invoiceRef:  ic.ref,
        poId,
        vendorName:  ic.vendorName,
        agencyName:  ic.agencyName,
        status:      ic.status,
        totalAmount: ic.totalAmount,
        paidAmount:  ic.paidAmount,
        dueDate:     ic.dueDate,
        notes:       `Demo invoice — ${ic.agencyName}`,
      },
    });
    invCount++;
  }
  console.log(`  ✔  Invoices: ${invCount} new`);

  // ── Commerce Orders ────────────────────────────────────────────────────────
  let comCount = 0;
  for (const co of COMMERCE_CONFIGS) {
    const existing = await (prisma as any).commerceOrder.findFirst({
      where: { platform: co.platform, externalId: co.externalId },
    });
    if (existing) continue;
    const feeAmountUsd = Math.max(25, Math.round(co.profitUsd * co.feeRate * 100) / 100);
    await (prisma as any).commerceOrder.create({
      data: {
        platform:    co.platform,
        externalId:  co.externalId,
        status:      co.status,
        profitUsd:   co.profitUsd,
        feeRate:     co.feeRate,
        feeAmountUsd,
        channel:     co.channel,
        notes:       co.notes,
        itemsJson:   JSON.stringify([{ sku: `${co.platform.slice(0,3)}-SKU-001`, quantity: 1, unitPrice: co.profitUsd }]),
      },
    });
    comCount++;
  }
  console.log(`  ✔  Commerce Orders: ${comCount} new across ${new Set(COMMERCE_CONFIGS.map(c=>c.platform)).size} platforms`);

  // ── SAM Watchlist ─────────────────────────────────────────────────────────
  let samCount = 0;
  for (const sw of SAM_WATCHLIST) {
    const existing = await (prisma as any).samOpportunity.findFirst({ where: { noticeId: sw.noticeId } });
    if (existing) continue;
    await (prisma as any).samOpportunity.create({ data: sw });
    samCount++;
  }
  console.log(`  ✔  SAM Watchlist: ${samCount} new entries`);

  // ── Summary ───────────────────────────────────────────────────────────────
  const [contracts, bids, pos, ships, invs, commerce, sam] = await Promise.all([
    (prisma as any).govContract.count(),
    (prisma as any).govBid.count(),
    (prisma as any).govPO.count(),
    (prisma as any).govShipment.count(),
    (prisma as any).govInvoice.count(),
    (prisma as any).commerceOrder.count(),
    (prisma as any).samOpportunity.count(),
  ]);

  const totalPoValue     = await (prisma as any).govPO.aggregate({ _sum: { totalValue: true } });
  const totalInvoiced    = await (prisma as any).govInvoice.aggregate({ _sum: { totalAmount: true } });
  const totalPaid        = await (prisma as any).govInvoice.aggregate({ _sum: { paidAmount: true } });
  const totalFeeRevenue  = await (prisma as any).commerceOrder.aggregate({ _sum: { feeAmountUsd: true } });

  console.log(`
✅  Demo seed complete!

  DATABASE STATE
  ─────────────────────────────────────────────
  Contracts:        ${contracts}
  Bids/Quotes:      ${bids}
  Purchase Orders:  ${pos}   (PO Value: $${(totalPoValue._sum.totalValue || 0).toLocaleString()})
  Shipments:        ${ships}
  Invoices:         ${invs}   (Invoiced: $${(totalInvoiced._sum.totalAmount || 0).toLocaleString()} | Paid: $${(totalPaid._sum.paidAmount || 0).toLocaleString()})
  Commerce Orders:  ${commerce}
  Fee Revenue:      $${(totalFeeRevenue._sum.feeAmountUsd || 0).toFixed(2)}
  SAM Watchlist:    ${sam}

  DEMO KEYS
  ─────────────────────────────────────────────
  Architect:  la-arc-305a0c0d1b96600275d95978e66d2d47d9bb
  Operator:   la-opr-d713a007a3a47494ed56c667313b261aeaf8

  LIVE URLS
  ─────────────────────────────────────────────
  Command Center:  /command-center
  Vendor Portal:   /vendor-portal
  API Docs:        /api
  Health:          /health
`);
}

main()
  .catch(e => { console.error("Demo seed error:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
