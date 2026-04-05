// modules/division10/division10.service.ts
// Division 10 — Intelligence & System View

import { registry, currentOperator } from "../../src/core/engine";
import { RapidResponseOperatorService } from "../../src/services/RapidResponseOperatorService";
import {
  SystemSummary, SystemHealth, DivisionStatus,
  FinancialIntelligence, InventoryIntelligence,
  OperatorIntelligence, ContractIntelligence,
  SystemAlert, FullIntelligenceReport,
} from "./division10.types";

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
    const operators = operatorService.getAll();
    if (!operators.length) return { totalOperators: 0, eliteCount: 0, seniorCount: 0, standardCount: 0, averageScore: 0 };
    const eliteCount    = operators.filter(o => o.tier === "ELITE").length;
    const seniorCount   = operators.filter(o => o.tier === "SENIOR").length;
    const standardCount = operators.filter(o => o.tier === "STANDARD").length;
    const averageScore  = Math.round(operators.reduce((s, o) => s + (o.performanceScore ?? 0), 0) / operators.length);
    const top = [...operators].sort((a, b) => (b.performanceScore ?? 0) - (a.performanceScore ?? 0))[0];
    return {
      totalOperators: operators.length, eliteCount, seniorCount, standardCount, averageScore,
      topOperator: top ? { id: top.id, name: top.name, score: top.performanceScore ?? 0, tier: top.tier ?? "STANDARD" } : undefined,
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

  getAlerts(): SystemAlert[] {
    const alerts: SystemAlert[] = [];
    const now = new Date().toISOString();
    const products  = Object.keys(registry.products).length;
    const contracts = Object.keys(registry.contracts).length;
    const inventory = Object.values(registry.inventory) as any[];
    const shipments = Object.values(registry.shipments) as any[];
    const requests  = Object.values(registry.requests)  as any[];

    if (products === 0)
      alerts.push({ level: "WARN", division: 1, message: "No products imported. Run Division 1 import.", detectedAt: now });
    if (products > 0 && contracts === 0)
      alerts.push({ level: "WARN", division: 2, message: "Products exist but no contracts defined.", detectedAt: now });

    const openRequests = requests.filter(r => r.status === "OPEN" || r.status === "PENDING");
    if (openRequests.length)
      alerts.push({ level: "INFO", division: 3, message: `${openRequests.length} open request(s) pending fulfillment.`, detectedAt: now });

    const lowStock = inventory.filter(i => (i.quantity ?? i.qty ?? 0) <= 5);
    if (lowStock.length)
      alerts.push({ level: "WARN", division: 4, message: `${lowStock.length} SKU(s) at or below low-stock threshold (≤5 units).`, detectedAt: now });

    const pendingShipments = shipments.filter(s => s.status === "Pending" || s.status === "In Transit");
    if (pendingShipments.length)
      alerts.push({ level: "INFO", division: 5, message: `${pendingShipments.length} shipment(s) in transit or pending.`, detectedAt: now });

    if (!alerts.length)
      alerts.push({ level: "INFO", division: 10, message: "All systems nominal.", detectedAt: now });
    return alerts;
  }

  getFullReport(): FullIntelligenceReport {
    return {
      summary:    this.getSystemSummary(),
      health:     this.getSystemHealth(),
      financials: this.getFinancials(),
      inventory:  this.getInventory(),
      operators:  this.getOperators(),
      contracts:  this.getContracts(),
      alerts:     this.getAlerts(),
      generatedAt: new Date().toISOString(),
    };
  }

  getActions(limit?: number): typeof registry.actions {
    const actions = [...registry.actions].reverse();
    return limit ? actions.slice(0, limit) : actions;
  }

  getOperatorInfo() { return currentOperator; }
}

export const division10Service = new Division10Service();
