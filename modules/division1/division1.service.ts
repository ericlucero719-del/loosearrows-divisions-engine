// modules/division1/division1.service.ts
// Division 1 — Product Intake & Pricing

import { registry } from "../../src/core/engine";
import { Product, ProductCategory, PRODUCT_CATEGORIES, CATEGORY_META, CategoryMeta } from "./division1.types";

// Normalize exported catalog field names (Title Case / spaced) to camelCase schema
function normalize(raw: Record<string, any>): Record<string, any> {
  return {
    productName: raw.productName ?? raw["Product Name"],
    sku:         raw.sku         ?? raw["Product Code"] ?? raw["SKU"],
    clin:        raw.clin        ?? raw["CLIN"],
    naics:       raw.naics       ?? raw["NAICS"],
    brand:       raw.brand       ?? raw["Brand"],
    category:    raw.category    ?? raw["Category"],
    description: raw.description ?? raw["Description"],
    price:       raw.price       ?? raw["Price"],
    cost:        raw.cost        ?? raw["Cost"],
    margin:      (() => {
                   const m = raw.margin ?? raw["Margin"];
                   if (typeof m === "number") return m;
                   if (typeof m === "string") return parseFloat(m) || 0;
                   return undefined;
                 })(),
    status:      (raw.status ?? raw["Status"] ?? "active").toLowerCase(),
    imageUrl:    raw.imageUrl    ?? raw["Image URL"],
    source:      raw.source      ?? raw["Source"],
  };
}

// Validate that a category value is one of the 10 defined categories
function resolveCategory(value: string | undefined): ProductCategory | undefined {
  if (!value) return undefined;
  const upper = value.toUpperCase().replace(/[\s\-]+/g, "_") as ProductCategory;
  return PRODUCT_CATEGORIES.includes(upper as ProductCategory) ? upper : undefined;
}

export class Division1Service {
  // ── Import ─────────────────────────────────────────────────────────────────
  importProducts(products: Record<string, any>[]): { imported: number; skipped: number } {
    let imported = 0;
    let skipped  = 0;

    for (const raw of products) {
      const p = normalize(raw) as Product;
      if (!p.sku || !p.productName) { skipped++; continue; }

      const margin = p.cost > 0
        ? parseFloat((((p.price - p.cost) / p.price) * 100).toFixed(2))
        : 0;

      registry.products[p.sku] = {
        ...p,
        category:    resolveCategory(p.category as any) ?? (p.category as any),
        margin:      p.margin ?? margin,
        lastSynced:  new Date().toISOString(),
      };
      imported++;
    }

    return { imported, skipped };
  }

  // ── List all products (optionally filtered by category) ────────────────────
  listProducts(category?: string): Product[] {
    const all = Object.values(registry.products) as Product[];
    if (!category) return all;
    const cat = resolveCategory(category);
    if (!cat) return [];
    return all.filter(p => p.category === cat);
  }

  // ── Single product ─────────────────────────────────────────────────────────
  getProductBySku(sku: string): Product | null {
    return (registry.products[sku] as Product) ?? null;
  }

  // ── Create / upsert a single product ──────────────────────────────────────
  createProduct(data: Omit<Product, "lastSynced">): Product {
    const margin = data.cost > 0
      ? parseFloat((((data.price - data.cost) / data.price) * 100).toFixed(2))
      : 0;
    const product: Product = {
      ...data,
      category:   resolveCategory(data.category as any) ?? data.category,
      margin:     data.margin ?? margin,
      lastSynced: new Date().toISOString(),
    };
    registry.products[product.sku] = product;
    return product;
  }

  // ── Update a product ───────────────────────────────────────────────────────
  updateProduct(sku: string, updates: Partial<Omit<Product, "sku" | "lastSynced">>): Product | null {
    const existing = registry.products[sku] as Product | undefined;
    if (!existing) return null;

    const updated: Product = {
      ...existing,
      ...updates,
      category: resolveCategory((updates.category ?? existing.category) as any) ?? existing.category,
      sku,
      lastSynced: new Date().toISOString(),
    };
    registry.products[sku] = updated;
    return updated;
  }

  // ── Categories ─────────────────────────────────────────────────────────────
  listCategories(): CategoryMeta[] {
    const all = Object.values(registry.products) as Product[];
    return CATEGORY_META.map(meta => ({
      ...meta,
      productCount: all.filter(p => p.category === meta.id).length,
    }));
  }

  getCategory(catId: string): CategoryMeta | null {
    const cat = resolveCategory(catId);
    if (!cat) return null;
    const meta = CATEGORY_META.find(m => m.id === cat);
    if (!meta) return null;
    const all = Object.values(registry.products) as Product[];
    return { ...meta, productCount: all.filter(p => p.category === cat).length };
  }
}

export const division1Service = new Division1Service();
