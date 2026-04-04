// modules/division1/division1.service.ts
// Division 1 — Product Intake & Pricing

import { registry } from "../../src/core/engine";
import { Product } from "./division1.types";

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

export class Division1Service {
  importProducts(products: Record<string, any>[]): { imported: number; skipped: number } {
    let imported = 0;
    let skipped = 0;

    for (const raw of products) {
      const p = normalize(raw) as Product;
      if (!p.sku || !p.productName) { skipped++; continue; }
      const margin = p.cost > 0
        ? parseFloat((((p.price - p.cost) / p.price) * 100).toFixed(2))
        : 0;
      registry.products[p.sku] = {
        ...p,
        margin: p.margin ?? margin,
        lastSynced: new Date().toISOString(),
      };
      imported++;
    }

    return { imported, skipped };
  }

  listProducts(): Product[] {
    return Object.values(registry.products) as Product[];
  }

  getProductBySku(sku: string): Product | null {
    return (registry.products[sku] as Product) ?? null;
  }
}

export const division1Service = new Division1Service();
