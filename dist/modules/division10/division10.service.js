"use strict";
// modules/division10/division10.service.ts
// Division 10 — Intelligence & System View
Object.defineProperty(exports, "__esModule", { value: true });
exports.division10Service = exports.Division10Service = void 0;
const engine_1 = require("../../src/core/engine");
const RapidResponseOperatorService_1 = require("../../src/services/RapidResponseOperatorService");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const MARGIN_BANDS = { low: 0.08, target: 0.18, premium: 0.27 };
const startTime = Date.now();
const operatorService = new RapidResponseOperatorService_1.RapidResponseOperatorService();
const DIVISION_NAMES = {
    1: "Product Intake & Pricing",
    2: "Contract Alignment",
    3: "Requests & Work Orders",
    4: "Inventory & Assets",
    5: "Logistics & Fulfillment",
    6: "Compliance & Documentation",
    7: "Vendor & Partner Management",
    8: "Agency / Customer Management",
    9: "Financials",
    10: "Intelligence & System View",
};
const DIVISION_REGISTRY_KEYS = {
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
class Division10Service {
    getSystemSummary() {
        return {
            products: Object.keys(engine_1.registry.products).length,
            contracts: Object.keys(engine_1.registry.contracts).length,
            requests: Object.keys(engine_1.registry.requests).length,
            inventory: Object.keys(engine_1.registry.inventory).length,
            shipments: Object.keys(engine_1.registry.shipments).length,
            compliance: Object.keys(engine_1.registry.compliance).length,
            vendors: Object.keys(engine_1.registry.vendors).length,
            agencies: Object.keys(engine_1.registry.agencies).length,
            quotes: Object.keys(engine_1.registry.quotes).length,
            invoices: Object.keys(engine_1.registry.invoices).length,
            totalActions: engine_1.registry.actions.length,
            generatedAt: new Date().toISOString(),
        };
    }
    async getSystemHealth() {
        const safeCount = async (fn) => {
            try {
                return await fn();
            }
            catch {
                return 0;
            }
        };
        const [vendorCount, contractCount, bidCount, workRequestCount, poCount, shipmentCount, invoiceCount, productCount, complianceCount, agencyCount,] = await Promise.all([
            safeCount(() => prisma.govVendor.count()),
            safeCount(() => prisma.govContract.count()),
            safeCount(() => prisma.govBid.count()),
            safeCount(() => prisma.govWorkRequest.count()),
            safeCount(() => prisma.govPO.count()),
            safeCount(() => prisma.govShipment.count()),
            safeCount(() => prisma.govInvoice.count()),
            safeCount(() => prisma.govProduct.count()),
            safeCount(() => prisma.govComplianceDoc.count()),
            safeCount(() => prisma.govAgency.count()),
        ]);
        const dbCounts = {
            1: productCount,
            2: contractCount,
            3: bidCount + workRequestCount,
            4: poCount,
            5: shipmentCount,
            6: complianceCount,
            7: vendorCount,
            8: agencyCount,
            9: invoiceCount,
        };
        const divisions = Object.entries(DIVISION_REGISTRY_KEYS).map(([id, key]) => {
            const numId = Number(id);
            const count = dbCounts[numId] !== undefined
                ? dbCounts[numId]
                : Object.keys(engine_1.registry[key]).length;
            const lastAction = [...engine_1.registry.actions].reverse().find(a => a.division === `DIVISION-${id}`);
            return {
                id: numId,
                name: DIVISION_NAMES[numId],
                recordCount: count,
                lastAction: lastAction?.timestamp,
                status: count === 0 ? "EMPTY" : "ACTIVE",
            };
        });
        divisions.push({ id: 10, name: DIVISION_NAMES[10], recordCount: engine_1.registry.actions.length, status: "ACTIVE" });
        return {
            status: "OK",
            uptime: Math.floor((Date.now() - startTime) / 1000),
            timestamp: new Date().toISOString(),
            divisions,
        };
    }
    getFinancials() {
        const quotes = Object.values(engine_1.registry.quotes);
        const invoices = Object.values(engine_1.registry.invoices);
        const totalQuoted = quotes.reduce((s, q) => s + (q.totalAmount ?? q.total ?? 0), 0);
        const totalInvoiced = invoices.reduce((s, i) => s + (i.totalAmount ?? i.total ?? 0), 0);
        const openQuotes = quotes.filter(q => q.status === "OPEN" || !q.status).length;
        const paidInvoices = invoices.filter(i => i.status === "PAID").length;
        const pendingInvoices = invoices.filter(i => i.status !== "PAID").length;
        const conversionRate = quotes.length ? `${((invoices.length / quotes.length) * 100).toFixed(1)}%` : "0%";
        const skuCount = {};
        quotes.forEach(q => (q.lineItems ?? []).forEach((li) => {
            if (li.sku)
                skuCount[li.sku] = (skuCount[li.sku] ?? 0) + 1;
        }));
        const topQuotedProducts = Object.entries(skuCount)
            .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([sku, count]) => ({ sku, count }));
        return {
            totalQuoted: Math.round(totalQuoted * 100) / 100,
            totalInvoiced: Math.round(totalInvoiced * 100) / 100,
            conversionRate, openQuotes, paidInvoices, pendingInvoices, topQuotedProducts,
        };
    }
    getInventory() {
        const items = Object.values(engine_1.registry.inventory);
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
    getOperators() {
        const raw = operatorService.getAll();
        const TIER_ROLE = { ELITE: "Architect", SENIOR: "Senior Operator", STANDARD: "Field Operator" };
        const TIER_LEVEL = { ELITE: 3, SENIOR: 2, STANDARD: 1 };
        const statusMap = (s) => {
            if (s === "AVAILABLE")
                return "active";
            if (s === "BUSY")
                return "busy";
            return "inactive";
        };
        const operators = raw.map(o => ({
            name: o.name,
            role: o.role ?? TIER_ROLE[o.tier] ?? "Field Operator",
            status: statusMap(o.status),
            relicsCreated: o.relicsCreated ?? 0,
            authorityLevel: o.authorityLevel ?? TIER_LEVEL[o.tier] ?? 1,
            tier: o.tier,
            performanceScore: o.performanceScore,
        }));
        if (!raw.length)
            return { totalOperators: 0, eliteCount: 0, seniorCount: 0, standardCount: 0, averageScore: 0, operators: [] };
        const eliteCount = raw.filter(o => o.tier === "ELITE").length;
        const seniorCount = raw.filter(o => o.tier === "SENIOR").length;
        const standardCount = raw.filter(o => o.tier === "STANDARD").length;
        const averageScore = Math.round(raw.reduce((s, o) => s + (o.performanceScore ?? 0), 0) / raw.length);
        const top = [...raw].sort((a, b) => (b.performanceScore ?? 0) - (a.performanceScore ?? 0))[0];
        return {
            totalOperators: raw.length,
            eliteCount, seniorCount, standardCount, averageScore,
            topOperator: top ? { id: top.id, name: top.name, score: top.performanceScore ?? 0, tier: top.tier ?? "STANDARD" } : undefined,
            operators,
        };
    }
    getContracts() {
        const contracts = Object.values(engine_1.registry.contracts);
        const totalCLINs = contracts.reduce((s, c) => s + (c.catalog ?? c.products ?? []).length, 0);
        const contractsWithProducts = contracts.filter(c => (c.catalog ?? c.products ?? []).length > 0).length;
        const topContracts = contracts
            .map(c => ({ contractRef: c.contractRef ?? c.id, productCount: (c.catalog ?? c.products ?? []).length }))
            .sort((a, b) => b.productCount - a.productCount).slice(0, 5);
        return { totalContracts: contracts.length, totalCLINs, contractsWithProducts, topContracts };
    }
    getAlerts() {
        const raw = [];
        const now = new Date().toISOString();
        const products = Object.keys(engine_1.registry.products).length;
        const contracts = Object.keys(engine_1.registry.contracts).length;
        const inventory = Object.values(engine_1.registry.inventory);
        const shipments = Object.values(engine_1.registry.shipments);
        const requests = Object.values(engine_1.registry.requests);
        const quotes = Object.values(engine_1.registry.quotes);
        const compliance = Object.values(engine_1.registry.compliance);
        // ── Division 1 — Product Catalog ─────────────────────────────────────
        if (products === 0)
            raw.push({ level: "WARN", division: 1, message: "No products imported. Run Division 1 intake.", detectedAt: now });
        // ── Division 2 — Contracts ────────────────────────────────────────────
        if (products > 0 && contracts === 0)
            raw.push({ level: "WARN", division: 2, message: "Products exist but no contracts defined.", detectedAt: now });
        const expiringContracts = Object.values(engine_1.registry.contracts)
            .filter(c => c.expiresAt && new Date(c.expiresAt) < new Date(Date.now() + 30 * 86400000));
        if (expiringContracts.length)
            raw.push({ level: "CRITICAL", division: 2, message: `${expiringContracts.length} contract(s) expiring within 30 days.`, detectedAt: now });
        // ── Division 3 — Requests ─────────────────────────────────────────────
        const openRequests = requests.filter(r => r.status === "OPEN" || r.status === "PENDING");
        if (openRequests.length)
            raw.push({ level: "INFO", division: 3, message: `${openRequests.length} open request(s) pending fulfillment.`, detectedAt: now });
        // ── Division 4 — Inventory ────────────────────────────────────────────
        const outOfStock = inventory.filter(i => (i.quantity ?? i.qty ?? 0) === 0);
        if (outOfStock.length)
            raw.push({ level: "CRITICAL", division: 4, message: `${outOfStock.length} SKU(s) completely out of stock.`, detectedAt: now });
        const lowStock = inventory.filter(i => { const q = i.quantity ?? i.qty ?? 0; return q > 0 && q <= 5; });
        if (lowStock.length)
            raw.push({ level: "WARN", division: 4, message: `${lowStock.length} SKU(s) at or below low-stock threshold (≤5 units).`, detectedAt: now });
        // ── Division 5 — Shipments ────────────────────────────────────────────
        const pendingShipments = shipments.filter(s => s.status === "Pending" || s.status === "In Transit");
        if (pendingShipments.length)
            raw.push({ level: "INFO", division: 5, message: `${pendingShipments.length} shipment(s) in transit or pending.`, detectedAt: now });
        const overdueShipments = shipments.filter(s => s.expectedDelivery && new Date(s.expectedDelivery) < new Date() && s.status !== "Delivered");
        if (overdueShipments.length)
            raw.push({ level: "CRITICAL", division: 5, message: `${overdueShipments.length} shipment(s) past expected delivery date.`, detectedAt: now });
        // ── Division 6 — Compliance ───────────────────────────────────────────
        const flaggedCompliance = compliance.filter(c => c.status === "FLAGGED" || c.status === "FAILED");
        if (flaggedCompliance.length)
            raw.push({ level: "CRITICAL", division: 6, message: `${flaggedCompliance.length} compliance record(s) flagged or failed.`, detectedAt: now });
        // ── Division 8 — Quotes / Pipeline ───────────────────────────────────
        const staleRFQs = quotes.filter(q => q.createdAt && new Date(q.createdAt) < new Date(Date.now() - 14 * 86400000) &&
            (q.status ?? "DRAFT").toUpperCase() === "DRAFT");
        if (staleRFQs.length)
            raw.push({ level: "WARN", division: 8, message: `${staleRFQs.length} RFQ(s) in DRAFT status for over 14 days.`, detectedAt: now });
        // ── Division 10 — System ──────────────────────────────────────────────
        const uptimeMs = Date.now() - startTime;
        if (uptimeMs < 60000)
            raw.push({ level: "INFO", division: 10, message: "System recently restarted. Data may still be seeding.", detectedAt: now });
        if (!raw.length)
            raw.push({ level: "INFO", division: 10, message: "All systems nominal.", detectedAt: now });
        // ── Map level → severity ──────────────────────────────────────────────
        const severityOf = (level) => {
            if (level === "CRITICAL")
                return "high";
            if (level === "WARN")
                return "medium";
            return "low";
        };
        const alerts = raw.map(a => ({ ...a, severity: severityOf(a.level) }));
        return {
            divisionId: 10,
            alerts,
            severityLevels: {
                low: alerts.filter(a => a.severity === "low"),
                medium: alerts.filter(a => a.severity === "medium"),
                high: alerts.filter(a => a.severity === "high"),
            },
            generatedAt: now,
        };
    }
    async getFullReport() {
        return {
            summary: this.getSystemSummary(),
            health: await this.getSystemHealth(),
            financials: this.getFinancials(),
            inventory: this.getInventory(),
            operators: this.getOperators(),
            contracts: this.getContracts(),
            margins: this.getMargins(),
            supply: this.getSupply(),
            pipeline: this.getPipeline(),
            alerts: this.getAlerts(),
            assessment: this.getAssessment(),
            generatedAt: new Date().toISOString(),
        };
    }
    getMargins() {
        const products = Object.values(engine_1.registry.products);
        const inventory = Object.values(engine_1.registry.inventory);
        const invoices = Object.values(engine_1.registry.invoices);
        // Build revenue/cost totals from invoices + product catalog pricing
        let monthlyRevenue = invoices.reduce((s, i) => s + (i.totalAmount ?? i.total ?? 0), 0);
        let monthlyCost = 0;
        // Enrich with cost data from product catalog
        invoices.forEach(inv => {
            (inv.lineItems ?? []).forEach((li) => {
                const prod = products.find(p => p.sku === li.sku);
                if (prod?.cost)
                    monthlyCost += prod.cost * (li.quantity ?? 1);
            });
        });
        // Fall back to product-level margin estimates when no invoices exist
        if (monthlyRevenue === 0) {
            products.forEach(p => {
                monthlyRevenue += (p.price ?? 0);
                monthlyCost += (p.cost ?? (p.price ?? 0) * (1 - (p.margin ?? 0.18)));
            });
        }
        const blendedMargin = monthlyRevenue > 0 ? (monthlyRevenue - monthlyCost) / monthlyRevenue : 0;
        const blendedMarginPct = `${(blendedMargin * 100).toFixed(1)}%`;
        // Capital efficiency = revenue generated per dollar of inventory held
        const inventoryValue = inventory.reduce((s, i) => {
            const prod = products.find(p => p.sku === (i.sku ?? i.productId));
            return s + (prod?.cost ?? 0) * (i.quantity ?? i.qty ?? 0);
        }, 0);
        const capitalEfficiencyScore = inventoryValue > 0
            ? Math.round((monthlyRevenue / inventoryValue) * 100) / 100
            : 0;
        // Group by category
        const catMap = {};
        products.forEach(p => {
            const cat = p.category ?? "Uncategorized";
            if (!catMap[cat])
                catMap[cat] = { revenue: 0, cost: 0, skus: new Set() };
            catMap[cat].revenue += p.price ?? 0;
            catMap[cat].cost += p.cost ?? (p.price ?? 0) * 0.82;
            catMap[cat].skus.add(p.sku);
        });
        const bandFor = (m) => {
            if (m >= MARGIN_BANDS.premium)
                return "PREMIUM";
            if (m >= MARGIN_BANDS.target)
                return "TARGET";
            if (m >= MARGIN_BANDS.low)
                return "LOW";
            return "BELOW_LOW";
        };
        const topCategories = Object.entries(catMap)
            .map(([category, v]) => {
            const margin = v.revenue > 0 ? (v.revenue - v.cost) / v.revenue : 0;
            return {
                category,
                revenue: Math.round(v.revenue * 100) / 100,
                cost: Math.round(v.cost * 100) / 100,
                margin: Math.round(margin * 10000) / 10000,
                marginPct: `${(margin * 100).toFixed(1)}%`,
                band: bandFor(margin),
                skuCount: v.skus.size,
            };
        })
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
        // Risk flags — products with margin below low band or missing cost data
        const riskFlags = products
            .filter(p => {
            if (!p.price)
                return false;
            const m = p.cost ? (p.price - p.cost) / p.price : null;
            return m === null || m < MARGIN_BANDS.low;
        })
            .map(p => {
            const m = p.cost ? (p.price - p.cost) / p.price : null;
            const flag = {
                sku: p.sku,
                reason: m === null ? "Missing cost data" : `Margin ${(m * 100).toFixed(1)}% below low threshold (${(MARGIN_BANDS.low * 100)}%)`,
                margin: m !== null ? Math.round(m * 10000) / 10000 : 0,
                severity: m === null ? "MEDIUM" : m < 0 ? "HIGH" : "LOW",
            };
            return flag;
        })
            .slice(0, 20);
        return {
            divisionId: 10,
            marginBands: MARGIN_BANDS,
            monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
            monthlyCost: Math.round(monthlyCost * 100) / 100,
            blendedMargin: Math.round(blendedMargin * 10000) / 10000,
            blendedMarginPct,
            capitalEfficiencyScore,
            topCategories,
            riskFlags,
            generatedAt: new Date().toISOString(),
        };
    }
    getSupply() {
        const products = Object.values(engine_1.registry.products);
        const inventory = Object.values(engine_1.registry.inventory);
        const vendors = Object.values(engine_1.registry.vendors ?? {});
        // ── Build SupplyItem list ──────────────────────────────────────────────
        const REORDER_DEFAULT = 5;
        const items = inventory.map(inv => {
            const prod = products.find(p => p.sku === (inv.sku ?? inv.productId));
            const qty = inv.quantity ?? inv.qty ?? 0;
            const reorderPoint = inv.reorderPoint ?? prod?.reorderPoint ?? REORDER_DEFAULT;
            const ratio = reorderPoint > 0 ? qty / reorderPoint : 1;
            const status = qty === 0 ? "OUT"
                : ratio < 0.5 ? "CRITICAL"
                    : ratio < 1.0 ? "LOW"
                        : "OK";
            return {
                sku: inv.sku ?? prod?.sku ?? "UNKNOWN",
                productName: prod?.name ?? prod?.title ?? inv.sku ?? "Unknown Product",
                qty,
                reorderPoint,
                status,
                category: prod?.category ?? prod?.productType ?? inv.category,
                vendor: inv.vendorId ?? prod?.vendorId,
                lastRestocked: inv.lastRestocked,
            };
        });
        // ── Supplier availability: aggregate skus per vendor ──────────────────
        const vendorMap = {};
        // Seed from vendor registry
        vendors.forEach(v => {
            const id = v.vendorId ?? v.id;
            if (!id)
                return;
            vendorMap[id] = {
                name: v.name ?? v.vendorName ?? id,
                skus: new Set(),
                active: v.status === "ACTIVE" || v.active !== false,
            };
        });
        // Populate from product catalog
        products.forEach(p => {
            const vid = p.vendorId ?? p.vendor;
            if (!vid)
                return;
            if (!vendorMap[vid])
                vendorMap[vid] = { name: vid, skus: new Set(), active: true };
            vendorMap[vid].skus.add(p.sku);
        });
        const supplierAvailability = Object.entries(vendorMap).map(([id, v]) => {
            const raw = vendors.find(x => (x.vendorId ?? x.id) === id);
            return {
                vendorId: id,
                vendorName: v.name,
                skus: [...v.skus],
                skuCount: v.skus.size,
                status: v.active ? "ACTIVE" : "INACTIVE",
                reliability: raw?.reliability ?? raw?.reliabilityScore,
                responseTime: raw?.responseTime ?? raw?.leadTime,
                categoryFit: raw?.categoryFit ?? raw?.categories ?? [],
            };
        });
        // ── Restock alerts: items at or below reorder point ───────────────────
        const urgency = (item) => {
            if (item.status === "OUT")
                return "CRITICAL";
            if (item.status === "CRITICAL")
                return "HIGH";
            if (item.status === "LOW")
                return "MEDIUM";
            return "LOW";
        };
        const restockAlerts = items
            .filter(i => i.status !== "OK")
            .map(i => {
            const suggested = Math.max((i.reorderPoint * 2) - i.qty, 1);
            return {
                sku: i.sku,
                productName: i.productName,
                currentQty: i.qty,
                reorderPoint: i.reorderPoint,
                suggestedQty: suggested,
                vendor: i.vendor,
                urgency: urgency(i),
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
            divisionId: 10,
            items,
            supplierAvailability,
            restockAlerts,
            volatilityIndex,
            generatedAt: new Date().toISOString(),
        };
    }
    getPipeline() {
        const contracts = Object.values(engine_1.registry.contracts);
        const quotes = Object.values(engine_1.registry.quotes);
        const agencies = Object.values(engine_1.registry.agencies);
        // ── Active Contracts ────────────────────────────────────────────────────
        const activeContracts = contracts.map(c => {
            const clins = (c.catalog ?? c.products ?? c.clins ?? []).length;
            const val = c.totalValue ?? c.value ?? c.estimatedValue ??
                (c.catalog ?? []).reduce((s, p) => s + (p.unitPrice ?? p.price ?? 0), 0);
            const rawStatus = (c.status ?? "ACTIVE").toUpperCase();
            const status = ["ACTIVE", "PENDING", "EXPIRING", "CLOSED"].includes(rawStatus)
                ? rawStatus
                : "ACTIVE";
            return {
                contractRef: c.contractRef ?? c.id ?? c.contractId ?? "UNKNOWN",
                agency: c.agency ?? c.agencyName ?? c.customer ?? "Unspecified",
                value: Math.round((val ?? 0) * 100) / 100,
                status,
                clinCount: clins,
                expiresAt: c.expiresAt ?? c.endDate,
            };
        });
        const totalContractValue = activeContracts.reduce((s, c) => s + c.value, 0);
        // ── Pipeline RFQs ────────────────────────────────────────────────────────
        const pipelineRFQs = quotes.map(q => {
            const rawStatus = (q.status ?? "DRAFT").toUpperCase().replace(/ /g, "_");
            const status = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "AWARDED", "LOST"].includes(rawStatus)
                ? rawStatus
                : "DRAFT";
            const est = q.estimatedValue ?? q.totalAmount ?? q.total ??
                (q.lineItems ?? []).reduce((s, li) => s + (li.unitPrice ?? li.price ?? 0) * (li.quantity ?? li.qty ?? 1), 0);
            return {
                rfqId: q.rfqId ?? q.quoteId ?? q.id ?? "UNKNOWN",
                agency: q.agency ?? q.agencyName ?? q.customer ?? "Unknown",
                description: q.description ?? q.title ?? q.subject ?? "Unspecified",
                estimatedValue: Math.round((est ?? 0) * 100) / 100,
                status,
                submittedAt: q.submittedAt ?? q.createdAt,
                dueDate: q.dueDate ?? q.deadline,
                winProbability: q.winProbability ?? q.win_probability,
            };
        });
        const totalPipelineValue = pipelineRFQs
            .filter(r => r.status !== "LOST")
            .reduce((s, r) => s + r.estimatedValue, 0);
        // Win rate — awarded / (awarded + lost)
        const awarded = quotes.filter(q => (q.status ?? "").toUpperCase() === "AWARDED").length;
        const lost = quotes.filter(q => (q.status ?? "").toUpperCase() === "LOST").length;
        const winRate = (awarded + lost) > 0
            ? Math.round((awarded / (awarded + lost)) * 10000) / 10000
            : 0;
        // ── Agency Relationships ─────────────────────────────────────────────────
        // Aggregate contract + quote data per agency name
        const agencyMap = {};
        // Seed from agencies registry
        agencies.forEach(a => {
            const id = a.agencyId ?? a.id;
            if (!id)
                return;
            agencyMap[id] = {
                id,
                name: a.name ?? a.agencyName ?? id,
                raw: a,
                contracts: 0,
                value: 0,
                lastContact: a.lastContact,
            };
        });
        // Tally from contracts
        activeContracts.forEach(c => {
            const key = c.agency;
            if (!agencyMap[key])
                agencyMap[key] = { id: key, name: key, contracts: 0, value: 0 };
            agencyMap[key].contracts += 1;
            agencyMap[key].value += c.value;
        });
        const tierFor = (a) => {
            if (a.contracts >= 3 || a.value >= 500000)
                return "PREFERRED";
            if (a.contracts >= 1 || a.value > 0)
                return "ACTIVE";
            if (a.raw?.prospect)
                return "PROSPECT";
            return "DORMANT";
        };
        const agencyRelationships = Object.values(agencyMap)
            .map(a => ({
            agencyId: a.id,
            agencyName: a.name,
            tier: tierFor(a),
            contracts: a.contracts,
            totalValue: Math.round(a.value * 100) / 100,
            lastContact: a.lastContact,
        }))
            .sort((a, b) => b.totalValue - a.totalValue);
        return {
            divisionId: 10,
            activeContracts,
            pipelineRFQs,
            winRate,
            agencyRelationships,
            totalPipelineValue: Math.round(totalPipelineValue * 100) / 100,
            totalContractValue: Math.round(totalContractValue * 100) / 100,
            generatedAt: new Date().toISOString(),
        };
    }
    getAssessment() {
        const products = Object.keys(engine_1.registry.products).length;
        const inventory = Object.values(engine_1.registry.inventory);
        const contracts = Object.values(engine_1.registry.contracts);
        const quotes = Object.values(engine_1.registry.quotes);
        const agencies = Object.values(engine_1.registry.agencies);
        const shipments = Object.values(engine_1.registry.shipments);
        const compliance = Object.values(engine_1.registry.compliance);
        const recommendations = [];
        // ─── FINANCIAL HEALTH ────────────────────────────────────────────────────
        let financialHealth = "unknown";
        let financialScore = 0;
        if (products === 0) {
            financialHealth = "initializing";
            financialScore = 25;
            recommendations.push("Import products via Division 1 to unlock financial analysis.");
        }
        else {
            const margins = this.getMargins();
            const m = margins.blendedMargin;
            if (m < 0) {
                financialHealth = "critical";
                financialScore = 10;
            }
            else if (m < MARGIN_BANDS.low) {
                financialHealth = "degraded";
                financialScore = 40;
            }
            else if (m < MARGIN_BANDS.target) {
                financialHealth = "degraded";
                financialScore = 65;
            }
            else {
                financialHealth = "healthy";
                financialScore = 100;
            }
            if (margins.riskFlags.length > 5)
                recommendations.push(`${margins.riskFlags.length} SKUs are below margin threshold — review cost data or reprice.`);
            if (m < MARGIN_BANDS.target)
                recommendations.push(`Blended margin at ${margins.blendedMarginPct} — target is ${(MARGIN_BANDS.target * 100)}%. Improve product mix or reduce COGS.`);
        }
        // ─── OPERATIONAL STATUS ──────────────────────────────────────────────────
        let operationalStatus = "initializing";
        let operationalScore = 25;
        if (products > 0) {
            const alertData = this.getAlerts();
            const highCount = alertData.severityLevels.high.length;
            const medCount = alertData.severityLevels.medium.length;
            if (highCount >= 3) {
                operationalStatus = "critical";
                operationalScore = 10;
            }
            else if (highCount >= 1) {
                operationalStatus = "degraded";
                operationalScore = 35;
            }
            else if (medCount >= 3) {
                operationalStatus = "degraded";
                operationalScore = 55;
            }
            else if (medCount >= 1) {
                operationalStatus = "degraded";
                operationalScore = 70;
            }
            else {
                operationalStatus = "healthy";
                operationalScore = 100;
            }
            if (highCount > 0)
                recommendations.push(`${highCount} critical alert(s) require immediate attention across active divisions.`);
            const overdue = shipments.filter(s => s.expectedDelivery && new Date(s.expectedDelivery) < new Date() && s.status !== "Delivered");
            if (overdue.length)
                recommendations.push(`${overdue.length} shipment(s) past expected delivery — contact carriers and update status.`);
            const flagged = compliance.filter(c => c.status === "FLAGGED" || c.status === "FAILED");
            if (flagged.length)
                recommendations.push(`${flagged.length} compliance record(s) flagged — resolve before next audit cycle.`);
        }
        // ─── SUPPLIER STRENGTH ───────────────────────────────────────────────────
        let supplierStrength = "unknown";
        let supplyScore = 0;
        if (inventory.length === 0 && Object.keys(engine_1.registry.vendors).length === 0) {
            supplierStrength = "unknown";
            supplyScore = 0;
            if (products > 0)
                recommendations.push("No inventory data found. Register stock levels via Division 4.");
        }
        else {
            const supply = this.getSupply();
            const outCount = supply.items.filter(i => i.status === "OUT").length;
            const critCount = supply.items.filter(i => i.status === "CRITICAL").length;
            const activeVend = supply.supplierAvailability.filter(v => v.status === "ACTIVE").length;
            const vi = supply.volatilityIndex;
            if (vi >= 0.6 || outCount > 3) {
                supplierStrength = "critical";
                supplyScore = 10;
            }
            else if (vi >= 0.3 || outCount > 0) {
                supplierStrength = "degraded";
                supplyScore = 40;
            }
            else if (critCount > 0) {
                supplierStrength = "degraded";
                supplyScore = 60;
            }
            else if (activeVend > 0) {
                supplierStrength = "healthy";
                supplyScore = 100;
            }
            else {
                supplierStrength = "initializing";
                supplyScore = 25;
            }
            if (outCount > 0)
                recommendations.push(`${outCount} SKU(s) completely out of stock — issue purchase orders immediately.`);
            if (supply.restockAlerts.filter(r => r.urgency === "CRITICAL").length)
                recommendations.push("Critical restock urgency on multiple SKUs — initiate emergency procurement.");
            if (activeVend === 0 && supply.supplierAvailability.length > 0)
                recommendations.push("No active suppliers on file — verify vendor status in Division 4.");
        }
        // ─── AGENCY TRUST ────────────────────────────────────────────────────────
        let agencyTrust = "unknown";
        let agencyScore = 0;
        const closedQuotes = quotes.filter(q => ["AWARDED", "LOST"].includes((q.status ?? "").toUpperCase()));
        const awarded = quotes.filter(q => (q.status ?? "").toUpperCase() === "AWARDED").length;
        const winRate = closedQuotes.length > 0 ? awarded / closedQuotes.length : null;
        const preferred = agencies.filter(a => a.tier === "PREFERRED").length;
        const hasAgencies = agencies.length > 0 || contracts.length > 0;
        if (!hasAgencies && quotes.length === 0) {
            agencyTrust = "unknown";
            agencyScore = 0;
            if (products > 0)
                recommendations.push("No agency relationships or pipeline RFQs on file. Register agencies to begin acquisition tracking.");
        }
        else if (winRate === null) {
            agencyTrust = "initializing";
            agencyScore = 25;
            recommendations.push("No closed RFQs yet — win rate will populate once quotes reach AWARDED or LOST status.");
        }
        else if (winRate < 0.25) {
            agencyTrust = "critical";
            agencyScore = 15;
            recommendations.push(`Win rate at ${(winRate * 100).toFixed(0)}% — review proposal quality and pricing strategy.`);
        }
        else if (winRate < 0.50) {
            agencyTrust = "degraded";
            agencyScore = 50;
            recommendations.push(`Win rate at ${(winRate * 100).toFixed(0)}% — target 50%+ through agency relationship development.`);
        }
        else {
            agencyTrust = "healthy";
            agencyScore = 100;
            if (preferred === 0 && agencies.length > 0)
                recommendations.push("No PREFERRED-tier agencies yet — deepen existing relationships to earn preferred status.");
        }
        // ─── COMPOSITE ───────────────────────────────────────────────────────────
        const nonZeroScores = [financialScore, operationalScore, supplyScore, agencyScore].filter(s => s > 0);
        const composite = nonZeroScores.length
            ? Math.round(nonZeroScores.reduce((a, b) => a + b, 0) / nonZeroScores.length)
            : 0;
        const overallStatus = [financialHealth, operationalStatus, supplierStrength, agencyTrust].includes("critical")
            ? "critical"
            : composite === 0 ? "unknown"
                : composite <= 25 ? "initializing"
                    : composite <= 55 ? "degraded"
                        : "healthy";
        // Deduplicate recommendations
        const seen = new Set();
        const dedupedRecs = recommendations.filter(r => !seen.has(r) && seen.add(r));
        return {
            divisionId: 10,
            summary: {
                financialHealth,
                operationalStatus,
                supplierStrength,
                agencyTrust,
            },
            recommendations: dedupedRecs,
            overallStatus,
            scoreBreakdown: {
                financial: financialScore,
                operational: operationalScore,
                supply: supplyScore,
                agency: agencyScore,
                composite,
            },
            generatedAt: new Date().toISOString(),
        };
    }
    getActions(limit) {
        const actions = [...engine_1.registry.actions].reverse();
        return limit ? actions.slice(0, limit) : actions;
    }
    getOperatorInfo() { return engine_1.currentOperator; }
    // ── Relics ────────────────────────────────────────────────────────────
    getRelics() {
        return engine_1.registry.relics;
    }
    createRelic(data) {
        const relicId = `RELIC-${String(engine_1.registry.relics.length + 1).padStart(3, "0")}`;
        const relic = {
            relicId,
            type: data.type,
            source: data.source,
            entity: data.entity,
            meaning: data.meaning,
            timestamp: data.timestamp ?? new Date().toISOString(),
            operatorId: data.operatorId ?? engine_1.currentOperator.id,
            divisionId: data.divisionId ?? 10,
        };
        engine_1.registry.relics.push(relic);
        return relic;
    }
}
exports.Division10Service = Division10Service;
exports.division10Service = new Division10Service();
//# sourceMappingURL=division10.service.js.map