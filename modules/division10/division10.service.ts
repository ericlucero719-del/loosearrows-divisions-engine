// modules/division10/division10.service.ts
// Division 10 — Intelligence & System View

import { registry, currentOperator } from "../../src/core/engine";
import { RapidResponseOperatorService } from "../../src/services/RapidResponseOperatorService";
import {
  SystemSummary, SystemHealth, DivisionStatus,
  FinancialIntelligence, InventoryIntelligence,
  OperatorIntelligence, OperatorRecord, ContractIntelligence,
  MarginIntelligence, CategoryMargin, RiskFlag,
  SupplyChainIntelligence, SupplyItem, SupplierAvailability, RestockAlert,
  ContractPipelineIntelligence, ActiveContract, PipelineRFQ, AgencyRelationship,
  SystemAlert, AlertIntelligence, FullIntelligenceReport,
} from "./division10.types";

const MARGIN_BANDS = { low: 0.08, target: 0.18, premium: 0.27 };

const startTime = Date.now();
const operatorService = new RapidResponseOperatorService();

const DIVISION_NAMES: Record<number, string> = {
  1:  "Product Intake & Pricing",
  2:  "Contract Alignment",
  3:  "Requests & Work Orders",
  4:  "Inventory & Assets",
  5:  "Logistics & Fulfillment",
  6:  "Compliance & Documentation",
  7:  "Vendor & Partner Management",
  8:  "Agency / Customer Management",
  9:  "Financials",
  10: "Intelligence & System View",
};

const DIVISION_REGISTRY_KEYS: Record<number, keyof typeof registry> = {
  1: "products",
  2: "contracts",
  3: "requests",
  4: "inventory",
  5: "shipments",
  6: "compliance",
  7: "vendors",
  8: "agencies",
  9: "quotes",
};

export class Division10Service {

  getSystemSummary(): SystemSummary {
    return {
      products:     Object.keys(registry.products).length,
      contracts:    Object.keys(registry.contracts).length,
      requests:     Object.keys(registry.requests).length,
      inventory:    Object.keys(registry.inventory).length,
      shipments:    Object.keys(registry.shipments).length,
      compliance:   Object.keys(registry.compliance).length,
      vendors:      Object.keys(registry.vendors).length,
      agencies:     Object.keys(registry.agencies).length,
      quotes:       Object.keys(registry.quotes).length,
      invoices:     Object.keys(registry.invoices).length,
      totalActions: registry.actions.length,
      generatedAt:  new Date().toISOString(),
    };
  }

  getSystemHealth(): SystemHealth {
    const divisions: DivisionStatus[] = Object.entries(DIVISION_REGISTRY_KEYS).map(([id, key]) => {
      const records = registry[key] as Record<string, any>;
      const count = Object.keys(records).length;
      const lastAction = [...registry.actions].reverse().find(a => a.division === `DIVISION-${id}`);
      return {
        id:          Number(id),
        name:        DIVISION_NAMES[Number(id)],
        recordCount: count,
        lastAction:  lastAction?.timestamp,
        status:      count === 0 ? "EMPTY" : "ACTIVE",
      } as DivisionStatus;
    });

    divisions.push({ id: 10, name: DIVISION_NAMES[10], recordCount: registry.actions.length, status: "ACTIVE" });

    return {
      status:    "OK",
      uptime:    Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
      divisions,
    };
  }

  getFinancials(): FinancialIntelligence {
    const quotes   = Object.values(registry.quotes)   as any[];
    const invoices = Object.values(registry.invoices) as any[];
    const totalQuoted   = quotes.reduce((s, q) => s + (q.totalAmount ?? q.total ?? 0), 0);
    const totalInvoiced = invoices.reduce((s, i) => s + (i.totalAmount ?? i.total ?? 0), 0);
    const openQuotes      = quotes.filter(q => q.status === "OPEN" || !q.status).length;
    const paidInvoices    = invoices.filter(i => i.status === "PAID").length;
    const pendingInvoices = invoices.filter(i => i.status !== "PAID").length;
    const conversionRate  = quotes.length ? `${((invoices.length / quotes.length) * 100).toFixed(1)}%` : "0%";

    const skuCount: Record<string, number> = {};
    quotes.forEach(q => (q.lineItems ?? []).forEach((li: any) => {
      if (li.sku) skuCount[li.sku] = (skuCount[li.sku] ?? 0) + 1;
    }));
    const topQuotedProducts = Object.entries(skuCount)
      .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([sku, count]) => ({ sku, count }));

    return {
      totalQuoted: Math.round(totalQuoted * 100) / 100,
      totalInvoiced: Math.round(totalInvoiced * 100) / 100,
      conversionRate, openQuotes, paidInvoices, pendingInvoices, topQuotedProducts,
    };
  }

  getInventory(): InventoryIntelligence {
    const items = Object.values(registry.inventory) as any[];
    const totalUnits = items.reduce((s, i) => s + (i.quantity ?? i.qty ?? 0), 0);
    const lowStockAlerts = items
      .filter(i => (i.quantity ?? i.qty ?? 0) <= 5)
      .map(i => ({ sku: i.sku ?? i.productId, qty: i.quantity ?? i.qty ?? 0 }))
      .sort((a, b) => a.qty - b.qty);
    const topStockedSKUs = [...items]
      .sort((a, b) => (b.quantity ?? b.qty ?? 0) - (a.quantity ?? a.qty ?? 0))
      .slice(0, 5)
      .map(i => ({ sku: i.sku ?? i.productId, qty: i.quantity ?? i.qty ?? 0 }));
    return { totalSKUs: items.length, totalUnits, lowStockAlerts, topStockedSKUs };
  }

  getOperators(): OperatorIntelligence {
    const raw = operatorService.getAll();

    const TIER_ROLE:  Record<string, string> = { ELITE: "Architect", SENIOR: "Senior Operator", STANDARD: "Field Operator" };
    const TIER_LEVEL: Record<string, number> = { ELITE: 3,           SENIOR: 2,                 STANDARD: 1 };

    const statusMap = (s: string): OperatorRecord["status"] => {
      if (s === "AVAILABLE") return "active";
      if (s === "BUSY")      return "busy";
      return "inactive";
    };

    const operators: OperatorRecord[] = raw.map(o => ({
      name:            o.name,
      role:            o.role ?? TIER_ROLE[o.tier]  ?? "Field Operator",
      status:          statusMap(o.status),
      relicsCreated:   o.relicsCreated   ?? 0,
      authorityLevel:  o.authorityLevel  ?? TIER_LEVEL[o.tier] ?? 1,
      tier:            o.tier,
      performanceScore: o.performanceScore,
    }));

    if (!raw.length) return { totalOperators: 0, eliteCount: 0, seniorCount: 0, standardCount: 0, averageScore: 0, operators: [] };

    const eliteCount    = raw.filter(o => o.tier === "ELITE").length;
    const seniorCount   = raw.filter(o => o.tier === "SENIOR").length;
    const standardCount = raw.filter(o => o.tier === "STANDARD").length;
    const averageScore  = Math.round(raw.reduce((s, o) => s + (o.performanceScore ?? 0), 0) / raw.length);
    const top = [...raw].sort((a, b) => (b.performanceScore ?? 0) - (a.performanceScore ?? 0))[0];

    return {
      totalOperators: raw.length,
      eliteCount, seniorCount, standardCount, averageScore,
      topOperator: top ? { id: top.id, name: top.name, score: top.performanceScore ?? 0, tier: top.tier ?? "STANDARD" } : undefined,
      operators,
    };
  }

  getContracts(): ContractIntelligence {
    const contracts = Object.values(registry.contracts) as any[];
    const totalCLINs = contracts.reduce((s, c) => s + (c.catalog ?? c.products ?? []).length, 0);
    const contractsWithProducts = contracts.filter(c => (c.catalog ?? c.products ?? []).length > 0).length;
    const topContracts = contracts
      .map(c => ({ contractRef: c.contractRef ?? c.id, productCount: (c.catalog ?? c.products ?? []).length }))
      .sort((a, b) => b.productCount - a.productCount).slice(0, 5);
    return { totalContracts: contracts.length, totalCLINs, contractsWithProducts, topContracts };
  }

  getAlerts(): AlertIntelligence {
    const raw: Omit<SystemAlert, "severity">[] = [];
    const now        = new Date().toISOString();
    const products   = Object.keys(registry.products).length;
    const contracts  = Object.keys(registry.contracts).length;
    const inventory  = Object.values(registry.inventory) as any[];
    const shipments  = Object.values(registry.shipments) as any[];
    const requests   = Object.values(registry.requests)  as any[];
    const quotes     = Object.values(registry.quotes)    as any[];
    const compliance = Object.values(registry.compliance) as any[];

    // ── Division 1 — Product Catalog ─────────────────────────────────────
    if (products === 0)
      raw.push({ level: "WARN",     division: 1,  message: "No products imported. Run Division 1 intake.", detectedAt: now });

    // ── Division 2 — Contracts ────────────────────────────────────────────
    if (products > 0 && contracts === 0)
      raw.push({ level: "WARN",     division: 2,  message: "Products exist but no contracts defined.", detectedAt: now });

    const expiringContracts = (Object.values(registry.contracts) as any[])
      .filter(c => c.expiresAt && new Date(c.expiresAt) < new Date(Date.now() + 30 * 86_400_000));
    if (expiringContracts.length)
      raw.push({ level: "CRITICAL", division: 2,  message: `${expiringContracts.length} contract(s) expiring within 30 days.`, detectedAt: now });

    // ── Division 3 — Requests ─────────────────────────────────────────────
    const openRequests = requests.filter(r => r.status === "OPEN" || r.status === "PENDING");
    if (openRequests.length)
      raw.push({ level: "INFO",     division: 3,  message: `${openRequests.length} open request(s) pending fulfillment.`, detectedAt: now });

    // ── Division 4 — Inventory ────────────────────────────────────────────
    const outOfStock = inventory.filter(i => (i.quantity ?? i.qty ?? 0) === 0);
    if (outOfStock.length)
      raw.push({ level: "CRITICAL", division: 4,  message: `${outOfStock.length} SKU(s) completely out of stock.`, detectedAt: now });

    const lowStock = inventory.filter(i => { const q = i.quantity ?? i.qty ?? 0; return q > 0 && q <= 5; });
    if (lowStock.length)
      raw.push({ level: "WARN",     division: 4,  message: `${lowStock.length} SKU(s) at or below low-stock threshold (≤5 units).`, detectedAt: now });

    // ── Division 5 — Shipments ────────────────────────────────────────────
    const pendingShipments = shipments.filter(s => s.status === "Pending" || s.status === "In Transit");
    if (pendingShipments.length)
      raw.push({ level: "INFO",     division: 5,  message: `${pendingShipments.length} shipment(s) in transit or pending.`, detectedAt: now });

    const overdueShipments = shipments.filter(s =>
      s.expectedDelivery && new Date(s.expectedDelivery) < new Date() && s.status !== "Delivered"
    );
    if (overdueShipments.length)
      raw.push({ level: "CRITICAL", division: 5,  message: `${overdueShipments.length} shipment(s) past expected delivery date.`, detectedAt: now });

    // ── Division 6 — Compliance ───────────────────────────────────────────
    const flaggedCompliance = compliance.filter(c => c.status === "FLAGGED" || c.status === "FAILED");
    if (flaggedCompliance.length)
      raw.push({ level: "CRITICAL", division: 6,  message: `${flaggedCompliance.length} compliance record(s) flagged or failed.`, detectedAt: now });

    // ── Division 8 — Quotes / Pipeline ───────────────────────────────────
    const staleRFQs = quotes.filter(q =>
      q.createdAt && new Date(q.createdAt) < new Date(Date.now() - 14 * 86_400_000) &&
      (q.status ?? "DRAFT").toUpperCase() === "DRAFT"
    );
    if (staleRFQs.length)
      raw.push({ level: "WARN",     division: 8,  message: `${staleRFQs.length} RFQ(s) in DRAFT status for over 14 days.`, detectedAt: now });

    // ── Division 10 — System ──────────────────────────────────────────────
    const uptimeMs = Date.now() - startTime;
    if (uptimeMs < 60_000)
      raw.push({ level: "INFO",     division: 10, message: "System recently restarted. Data may still be seeding.", detectedAt: now });

    if (!raw.length)
      raw.push({ level: "INFO",     division: 10, message: "All systems nominal.", detectedAt: now });

    // ── Map level → severity ──────────────────────────────────────────────
    const severityOf = (level: SystemAlert["level"]): SystemAlert["severity"] => {
      if (level === "CRITICAL") return "high";
      if (level === "WARN")     return "medium";
      return "low";
    };

    const alerts: SystemAlert[] = raw.map(a => ({ ...a, severity: severityOf(a.level) }));

    return {
      divisionId: 10,
      alerts,
      severityLevels: {
        low:    alerts.filter(a => a.severity === "low"),
        medium: alerts.filter(a => a.severity === "medium"),
        high:   alerts.filter(a => a.severity === "high"),
      },
      generatedAt: now,
    };
  }

  getFullReport(): FullIntelligenceReport {
    return {
      summary:    this.getSystemSummary(),
      health:     this.getSystemHealth(),
      financials: this.getFinancials(),
      inventory:  this.getInventory(),
      operators:  this.getOperators(),
      contracts:  this.getContracts(),
      margins:    this.getMargins(),
      supply:     this.getSupply(),
      pipeline:   this.getPipeline(),
      alerts:     this.getAlerts(),
      generatedAt: new Date().toISOString(),
    };
  }

  getMargins(): MarginIntelligence {
    const products  = Object.values(registry.products)  as any[];
    const inventory = Object.values(registry.inventory) as any[];
    const invoices  = Object.values(registry.invoices)  as any[];

    // Build revenue/cost totals from invoices + product catalog pricing
    let monthlyRevenue = invoices.reduce((s, i) => s + (i.totalAmount ?? i.total ?? 0), 0);
    let monthlyCost    = 0;

    // Enrich with cost data from product catalog
    invoices.forEach(inv => {
      (inv.lineItems ?? []).forEach((li: any) => {
        const prod = products.find(p => p.sku === li.sku);
        if (prod?.cost) monthlyCost += prod.cost * (li.quantity ?? 1);
      });
    });

    // Fall back to product-level margin estimates when no invoices exist
    if (monthlyRevenue === 0) {
      products.forEach(p => {
        monthlyRevenue += (p.price ?? 0);
        monthlyCost    += (p.cost  ?? (p.price ?? 0) * (1 - (p.margin ?? 0.18)));
      });
    }

    const blendedMargin    = monthlyRevenue > 0 ? (monthlyRevenue - monthlyCost) / monthlyRevenue : 0;
    const blendedMarginPct = `${(blendedMargin * 100).toFixed(1)}%`;

    // Capital efficiency = revenue generated per dollar of inventory held
    const inventoryValue   = inventory.reduce((s, i) => {
      const prod = products.find(p => p.sku === (i.sku ?? i.productId));
      return s + (prod?.cost ?? 0) * (i.quantity ?? i.qty ?? 0);
    }, 0);
    const capitalEfficiencyScore = inventoryValue > 0
      ? Math.round((monthlyRevenue / inventoryValue) * 100) / 100
      : 0;

    // Group by category
    const catMap: Record<string, { revenue: number; cost: number; skus: Set<string> }> = {};
    products.forEach(p => {
      const cat = p.category ?? "Uncategorized";
      if (!catMap[cat]) catMap[cat] = { revenue: 0, cost: 0, skus: new Set() };
      catMap[cat].revenue += p.price ?? 0;
      catMap[cat].cost    += p.cost  ?? (p.price ?? 0) * 0.82;
      catMap[cat].skus.add(p.sku);
    });

    const bandFor = (m: number): CategoryMargin["band"] => {
      if (m >= MARGIN_BANDS.premium) return "PREMIUM";
      if (m >= MARGIN_BANDS.target)  return "TARGET";
      if (m >= MARGIN_BANDS.low)     return "LOW";
      return "BELOW_LOW";
    };

    const topCategories: CategoryMargin[] = Object.entries(catMap)
      .map(([category, v]) => {
        const margin    = v.revenue > 0 ? (v.revenue - v.cost) / v.revenue : 0;
        return {
          category,
          revenue:   Math.round(v.revenue * 100) / 100,
          cost:      Math.round(v.cost    * 100) / 100,
          margin:    Math.round(margin    * 10000) / 10000,
          marginPct: `${(margin * 100).toFixed(1)}%`,
          band:      bandFor(margin),
          skuCount:  v.skus.size,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Risk flags — products with margin below low band or missing cost data
    const riskFlags: RiskFlag[] = products
      .filter(p => {
        if (!p.price) return false;
        const m = p.cost ? (p.price - p.cost) / p.price : null;
        return m === null || m < MARGIN_BANDS.low;
      })
      .map(p => {
        const m    = p.cost ? (p.price - p.cost) / p.price : null;
        const flag: RiskFlag = {
          sku:      p.sku,
          reason:   m === null ? "Missing cost data" : `Margin ${(m * 100).toFixed(1)}% below low threshold (${(MARGIN_BANDS.low * 100)}%)`,
          margin:   m !== null ? Math.round(m * 10000) / 10000 : 0,
          severity: m === null ? "MEDIUM" : m < 0 ? "HIGH" : "LOW",
        };
        return flag;
      })
      .slice(0, 20);

    return {
      divisionId:             10,
      marginBands:            MARGIN_BANDS,
      monthlyRevenue:         Math.round(monthlyRevenue * 100) / 100,
      monthlyCost:            Math.round(monthlyCost    * 100) / 100,
      blendedMargin:          Math.round(blendedMargin  * 10000) / 10000,
      blendedMarginPct,
      capitalEfficiencyScore,
      topCategories,
      riskFlags,
      generatedAt:            new Date().toISOString(),
    };
  }

  getSupply(): SupplyChainIntelligence {
    const products  = Object.values(registry.products)  as any[];
    const inventory = Object.values(registry.inventory) as any[];
    const vendors   = Object.values(registry.vendors ?? {}) as any[];

    // ── Build SupplyItem list ──────────────────────────────────────────────
    const REORDER_DEFAULT = 5;

    const items: SupplyItem[] = inventory.map(inv => {
      const prod        = products.find(p => p.sku === (inv.sku ?? inv.productId));
      const qty         = inv.quantity ?? inv.qty ?? 0;
      const reorderPoint= inv.reorderPoint ?? prod?.reorderPoint ?? REORDER_DEFAULT;
      const ratio       = reorderPoint > 0 ? qty / reorderPoint : 1;

      const status: SupplyItem["status"] =
        qty === 0           ? "OUT"
        : ratio < 0.5       ? "CRITICAL"
        : ratio < 1.0       ? "LOW"
        : "OK";

      return {
        sku:          inv.sku ?? prod?.sku ?? "UNKNOWN",
        productName:  prod?.name ?? prod?.title ?? inv.sku ?? "Unknown Product",
        qty,
        reorderPoint,
        status,
        vendor:       inv.vendorId ?? prod?.vendorId,
        lastRestocked: inv.lastRestocked,
      };
    });

    // ── Supplier availability: aggregate skus per vendor ──────────────────
    const vendorMap: Record<string, { name: string; skus: Set<string>; active: boolean }> = {};

    // Seed from vendor registry
    vendors.forEach(v => {
      const id = v.vendorId ?? v.id;
      if (!id) return;
      vendorMap[id] = {
        name:   v.name ?? v.vendorName ?? id,
        skus:   new Set(),
        active: v.status === "ACTIVE" || v.active !== false,
      };
    });

    // Populate from product catalog
    products.forEach(p => {
      const vid = p.vendorId ?? p.vendor;
      if (!vid) return;
      if (!vendorMap[vid]) vendorMap[vid] = { name: vid, skus: new Set(), active: true };
      vendorMap[vid].skus.add(p.sku);
    });

    const supplierAvailability: SupplierAvailability[] = Object.entries(vendorMap).map(([id, v]) => ({
      vendorId:   id,
      vendorName: v.name,
      skus:       [...v.skus],
      skuCount:   v.skus.size,
      status:     v.active ? "ACTIVE" : "INACTIVE",
    }));

    // ── Restock alerts: items at or below reorder point ───────────────────
    const urgency = (item: SupplyItem): RestockAlert["urgency"] => {
      if (item.status === "OUT")      return "CRITICAL";
      if (item.status === "CRITICAL") return "HIGH";
      if (item.status === "LOW")      return "MEDIUM";
      return "LOW";
    };

    const restockAlerts: RestockAlert[] = items
      .filter(i => i.status !== "OK")
      .map(i => {
        const suggested = Math.max((i.reorderPoint * 2) - i.qty, 1);
        return {
          sku:          i.sku,
          productName:  i.productName,
          currentQty:   i.qty,
          reorderPoint: i.reorderPoint,
          suggestedQty: suggested,
          vendor:       i.vendor,
          urgency:      urgency(i),
        };
      })
      .sort((a, b) => {
        const rank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return rank[a.urgency] - rank[b.urgency];
      });

    // ── Volatility index: ratio of non-OK items to total ─────────────────
    const volatilityIndex = items.length > 0
      ? Math.round((restockAlerts.length / items.length) * 100) / 100
      : 0;

    return {
      divisionId:           10,
      items,
      supplierAvailability,
      restockAlerts,
      volatilityIndex,
      generatedAt:          new Date().toISOString(),
    };
  }

  getPipeline(): ContractPipelineIntelligence {
    const contracts = Object.values(registry.contracts) as any[];
    const quotes    = Object.values(registry.quotes)    as any[];
    const agencies  = Object.values(registry.agencies)  as any[];

    // ── Active Contracts ────────────────────────────────────────────────────
    const activeContracts: ActiveContract[] = contracts.map(c => {
      const clins = (c.catalog ?? c.products ?? c.clins ?? []).length;
      const val   = c.totalValue ?? c.value ?? c.estimatedValue ??
                    (c.catalog ?? []).reduce((s: number, p: any) => s + (p.unitPrice ?? p.price ?? 0), 0);

      const rawStatus = (c.status ?? "ACTIVE").toUpperCase();
      const status: ActiveContract["status"] =
        ["ACTIVE","PENDING","EXPIRING","CLOSED"].includes(rawStatus)
          ? (rawStatus as ActiveContract["status"])
          : "ACTIVE";

      return {
        contractRef: c.contractRef ?? c.id ?? c.contractId ?? "UNKNOWN",
        agency:      c.agency ?? c.agencyName ?? c.customer ?? "Unspecified",
        value:       Math.round((val ?? 0) * 100) / 100,
        status,
        clinCount:   clins,
        expiresAt:   c.expiresAt ?? c.endDate,
      };
    });

    const totalContractValue = activeContracts.reduce((s, c) => s + c.value, 0);

    // ── Pipeline RFQs ────────────────────────────────────────────────────────
    const pipelineRFQs: PipelineRFQ[] = quotes.map(q => {
      const rawStatus = (q.status ?? "DRAFT").toUpperCase().replace(/ /g, "_");
      const status: PipelineRFQ["status"] =
        ["DRAFT","SUBMITTED","UNDER_REVIEW","AWARDED","LOST"].includes(rawStatus)
          ? (rawStatus as PipelineRFQ["status"])
          : "DRAFT";

      const est = q.estimatedValue ?? q.totalAmount ?? q.total ??
                  (q.lineItems ?? []).reduce((s: number, li: any) => s + (li.unitPrice ?? li.price ?? 0) * (li.quantity ?? li.qty ?? 1), 0);

      return {
        rfqId:          q.rfqId ?? q.quoteId ?? q.id ?? "UNKNOWN",
        agency:         q.agency ?? q.agencyName ?? q.customer ?? "Unknown",
        description:    q.description ?? q.title ?? q.subject ?? "Unspecified",
        estimatedValue: Math.round((est ?? 0) * 100) / 100,
        status,
        submittedAt:    q.submittedAt ?? q.createdAt,
        dueDate:        q.dueDate ?? q.deadline,
      };
    });

    const totalPipelineValue = pipelineRFQs
      .filter(r => r.status !== "LOST")
      .reduce((s, r) => s + r.estimatedValue, 0);

    // Win rate — awarded / (awarded + lost)
    const awarded = quotes.filter(q => (q.status ?? "").toUpperCase() === "AWARDED").length;
    const lost    = quotes.filter(q => (q.status ?? "").toUpperCase() === "LOST").length;
    const winRate = (awarded + lost) > 0
      ? Math.round((awarded / (awarded + lost)) * 10000) / 10000
      : 0;

    // ── Agency Relationships ─────────────────────────────────────────────────
    // Aggregate contract + quote data per agency name
    const agencyMap: Record<string, { id: string; name: string; raw?: any; contracts: number; value: number; lastContact?: string }> = {};

    // Seed from agencies registry
    agencies.forEach(a => {
      const id = a.agencyId ?? a.id;
      if (!id) return;
      agencyMap[id] = {
        id,
        name:        a.name ?? a.agencyName ?? id,
        raw:         a,
        contracts:   0,
        value:       0,
        lastContact: a.lastContact,
      };
    });

    // Tally from contracts
    activeContracts.forEach(c => {
      const key = c.agency;
      if (!agencyMap[key]) agencyMap[key] = { id: key, name: key, contracts: 0, value: 0 };
      agencyMap[key].contracts += 1;
      agencyMap[key].value     += c.value;
    });

    const tierFor = (a: typeof agencyMap[string]): AgencyRelationship["tier"] => {
      if (a.contracts >= 3 || a.value >= 500000) return "PREFERRED";
      if (a.contracts >= 1 || a.value > 0)       return "ACTIVE";
      if (a.raw?.prospect)                        return "PROSPECT";
      return "DORMANT";
    };

    const agencyRelationships: AgencyRelationship[] = Object.values(agencyMap)
      .map(a => ({
        agencyId:    a.id,
        agencyName:  a.name,
        tier:        tierFor(a),
        contracts:   a.contracts,
        totalValue:  Math.round(a.value * 100) / 100,
        lastContact: a.lastContact,
      }))
      .sort((a, b) => b.totalValue - a.totalValue);

    return {
      divisionId:          10,
      activeContracts,
      pipelineRFQs,
      winRate,
      agencyRelationships,
      totalPipelineValue:  Math.round(totalPipelineValue * 100) / 100,
      totalContractValue:  Math.round(totalContractValue * 100) / 100,
      generatedAt:         new Date().toISOString(),
    };
  }

  getActions(limit?: number): typeof registry.actions {
    const actions = [...registry.actions].reverse();
    return limit ? actions.slice(0, limit) : actions;
  }

  getOperatorInfo() { return currentOperator; }
}

export const division10Service = new Division10Service();
