// modules/division1/division1.service.ts
// Division 1 — Product Catalog & Pricing (PostgreSQL-backed)

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MARGIN_BANDS: Record<string, number> = { low: 0.08, target: 0.18, premium: 0.27 };

function calcMargin(cost: number, price: number): number {
  if (price <= 0) return 0;
  return Math.round(((price - cost) / price) * 10000) / 100;
}

function priceAt(cost: number, band: string): number {
  const m = MARGIN_BANDS[band] ?? MARGIN_BANDS.target;
  return Math.round((cost / (1 - m)) * 100) / 100;
}

function toProduct(row: any) {
  return {
    productId:     row.productId,
    sku:           row.sku,
    name:          row.name,
    description:   row.description   ?? undefined,
    category:      row.category      ?? undefined,
    unitOfMeasure: row.unitOfMeasure ?? undefined,
    cost:          row.cost,
    price:         row.price,
    marginPct:     row.marginPct,
    naics:         row.naics         ?? undefined,
    notes:         row.notes         ?? undefined,
    status:        row.status,
    createdAt:     row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt:     row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
  };
}

export class Division1Service {

  async listProducts(category?: string, status?: string) {
    const where: any = {};
    if (category) where.category = category;
    if (status)   where.status   = status;
    const rows = await prisma.govProduct.findMany({ where, orderBy: { name: "asc" } });
    return rows.map(toProduct);
  }

  async getProduct(sku: string) {
    const row = await prisma.govProduct.findUnique({ where: { sku } });
    return row ? toProduct(row) : null;
  }

  async createProduct(data: {
    sku:           string;
    name:          string;
    cost:          number;
    price?:        number;
    marginBand?:   string;
    description?:  string;
    category?:     string;
    unitOfMeasure?: string;
    naics?:        string;
    notes?:        string;
  }) {
    const cost  = data.cost;
    const price = data.price ?? priceAt(cost, data.marginBand ?? "target");
    const marginPct = calcMargin(cost, price);

    const row = await prisma.govProduct.create({
      data: {
        sku:           data.sku,
        name:          data.name,
        description:   data.description,
        category:      data.category,
        unitOfMeasure: data.unitOfMeasure,
        cost,
        price,
        marginPct,
        naics:         data.naics,
        notes:         data.notes,
      },
    });
    return toProduct(row);
  }

  async updateProduct(sku: string, data: Partial<{
    name:          string;
    description:   string;
    category:      string;
    unitOfMeasure: string;
    cost:          number;
    price:         number;
    marginBand:    string;
    naics:         string;
    notes:         string;
    status:        string;
  }>) {
    const existing = await prisma.govProduct.findUnique({ where: { sku } });
    if (!existing) throw new Error(`Product ${sku} not found`);

    const cost  = data.cost  ?? existing.cost;
    const price = data.price ?? (data.cost && data.marginBand ? priceAt(data.cost, data.marginBand) : existing.price);
    const marginPct = calcMargin(cost, price);

    const row = await prisma.govProduct.update({
      where: { sku },
      data:  { ...data, cost, price, marginPct, marginBand: undefined } as any,
    });
    return toProduct(row);
  }

  async deleteProduct(sku: string) {
    await prisma.govProduct.delete({ where: { sku } });
  }

  async priceCalc(sku: string) {
    const p = await prisma.govProduct.findUnique({ where: { sku } });
    if (!p) throw new Error(`Product ${sku} not found`);
    return {
      sku:    p.sku,
      name:   p.name,
      cost:   p.cost,
      bands: {
        low:     { price: priceAt(p.cost, "low"),     margin: "8%" },
        target:  { price: priceAt(p.cost, "target"),  margin: "18%" },
        premium: { price: priceAt(p.cost, "premium"), margin: "27%" },
      },
      current: { price: p.price, marginPct: p.marginPct },
    };
  }

  async bulkImport(products: Array<{
    sku: string; name: string; cost: number;
    price?: number; marginBand?: string;
    description?: string; category?: string;
    unitOfMeasure?: string; naics?: string; notes?: string;
  }>) {
    let imported = 0; let skipped = 0; const errors: string[] = [];
    for (const p of products) {
      if (!p.sku || !p.name || p.cost == null) { skipped++; errors.push(`Missing sku/name/cost: ${JSON.stringify(p)}`); continue; }
      try {
        const cost  = p.cost;
        const price = p.price ?? priceAt(cost, p.marginBand ?? "target");
        await prisma.govProduct.upsert({
          where:  { sku: p.sku },
          create: { sku: p.sku, name: p.name, description: p.description, category: p.category, unitOfMeasure: p.unitOfMeasure, cost, price, marginPct: calcMargin(cost, price), naics: p.naics, notes: p.notes },
          update: { name: p.name, description: p.description, category: p.category, unitOfMeasure: p.unitOfMeasure, cost, price, marginPct: calcMargin(cost, price), naics: p.naics, notes: p.notes },
        });
        imported++;
      } catch (e: any) { skipped++; errors.push(`${p.sku}: ${e.message}`); }
    }
    return { imported, skipped, errors };
  }

  async catalogSummary() {
    const products = await prisma.govProduct.findMany();
    const total    = products.length;
    const active   = products.filter(p => p.status === "active").length;
    const avgMargin = total ? Math.round(products.reduce((s, p) => s + p.marginPct, 0) / total * 100) / 100 : 0;

    const byCategory: Record<string, number> = {};
    for (const p of products) {
      const cat = p.category ?? "UNCATEGORIZED";
      byCategory[cat] = (byCategory[cat] ?? 0) + 1;
    }
    return { total, active, avgMarginPct: avgMargin, byCategory };
  }
}

export const division1Service = new Division1Service();
