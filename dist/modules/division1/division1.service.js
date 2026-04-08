"use strict";
// modules/division1/division1.service.ts
// Division 1 — Product Catalog & Pricing (PostgreSQL-backed)
Object.defineProperty(exports, "__esModule", { value: true });
exports.division1Service = exports.Division1Service = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const MARGIN_BANDS = { low: 0.08, target: 0.18, premium: 0.27 };
function calcMargin(cost, price) {
    if (price <= 0)
        return 0;
    return Math.round(((price - cost) / price) * 10000) / 100;
}
function priceAt(cost, band) {
    const m = MARGIN_BANDS[band] ?? MARGIN_BANDS.target;
    return Math.round((cost / (1 - m)) * 100) / 100;
}
function toProduct(row) {
    return {
        productId: row.productId,
        sku: row.sku,
        name: row.name,
        description: row.description ?? undefined,
        category: row.category ?? undefined,
        unitOfMeasure: row.unitOfMeasure ?? undefined,
        cost: row.cost,
        price: row.price,
        marginPct: row.marginPct,
        naics: row.naics ?? undefined,
        notes: row.notes ?? undefined,
        status: row.status,
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
        updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
    };
}
class Division1Service {
    async listProducts(category, status) {
        const where = {};
        if (category)
            where.category = category;
        if (status)
            where.status = status;
        const rows = await prisma.govProduct.findMany({ where, orderBy: { name: "asc" } });
        return rows.map(toProduct);
    }
    async getProduct(sku) {
        const row = await prisma.govProduct.findUnique({ where: { sku } });
        return row ? toProduct(row) : null;
    }
    async createProduct(data) {
        const cost = data.cost;
        const price = data.price ?? priceAt(cost, data.marginBand ?? "target");
        const marginPct = calcMargin(cost, price);
        const row = await prisma.govProduct.create({
            data: {
                sku: data.sku,
                name: data.name,
                description: data.description,
                category: data.category,
                unitOfMeasure: data.unitOfMeasure,
                cost,
                price,
                marginPct,
                naics: data.naics,
                notes: data.notes,
            },
        });
        return toProduct(row);
    }
    async updateProduct(sku, data) {
        const existing = await prisma.govProduct.findUnique({ where: { sku } });
        if (!existing)
            throw new Error(`Product ${sku} not found`);
        const cost = data.cost ?? existing.cost;
        const price = data.price ?? (data.cost && data.marginBand ? priceAt(data.cost, data.marginBand) : existing.price);
        const marginPct = calcMargin(cost, price);
        const row = await prisma.govProduct.update({
            where: { sku },
            data: { ...data, cost, price, marginPct, marginBand: undefined },
        });
        return toProduct(row);
    }
    async deleteProduct(sku) {
        await prisma.govProduct.delete({ where: { sku } });
    }
    async priceCalc(sku) {
        const p = await prisma.govProduct.findUnique({ where: { sku } });
        if (!p)
            throw new Error(`Product ${sku} not found`);
        return {
            sku: p.sku,
            name: p.name,
            cost: p.cost,
            bands: {
                low: { price: priceAt(p.cost, "low"), margin: "8%" },
                target: { price: priceAt(p.cost, "target"), margin: "18%" },
                premium: { price: priceAt(p.cost, "premium"), margin: "27%" },
            },
            current: { price: p.price, marginPct: p.marginPct },
        };
    }
    async bulkImport(products) {
        let imported = 0;
        let skipped = 0;
        const errors = [];
        for (const p of products) {
            if (!p.sku || !p.name || p.cost == null) {
                skipped++;
                errors.push(`Missing sku/name/cost: ${JSON.stringify(p)}`);
                continue;
            }
            try {
                const cost = p.cost;
                const price = p.price ?? priceAt(cost, p.marginBand ?? "target");
                await prisma.govProduct.upsert({
                    where: { sku: p.sku },
                    create: { sku: p.sku, name: p.name, description: p.description, category: p.category, unitOfMeasure: p.unitOfMeasure, cost, price, marginPct: calcMargin(cost, price), naics: p.naics, notes: p.notes },
                    update: { name: p.name, description: p.description, category: p.category, unitOfMeasure: p.unitOfMeasure, cost, price, marginPct: calcMargin(cost, price), naics: p.naics, notes: p.notes },
                });
                imported++;
            }
            catch (e) {
                skipped++;
                errors.push(`${p.sku}: ${e.message}`);
            }
        }
        return { imported, skipped, errors };
    }
    async catalogSummary() {
        const products = await prisma.govProduct.findMany();
        const total = products.length;
        const active = products.filter(p => p.status === "active").length;
        const avgMargin = total ? Math.round(products.reduce((s, p) => s + p.marginPct, 0) / total * 100) / 100 : 0;
        const byCategory = {};
        for (const p of products) {
            const cat = p.category ?? "UNCATEGORIZED";
            byCategory[cat] = (byCategory[cat] ?? 0) + 1;
        }
        return { total, active, avgMarginPct: avgMargin, byCategory };
    }
}
exports.Division1Service = Division1Service;
exports.division1Service = new Division1Service();
//# sourceMappingURL=division1.service.js.map