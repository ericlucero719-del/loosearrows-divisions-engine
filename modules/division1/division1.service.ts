// modules/division1/division1.service.ts
// Division 1 — Product Intake & Pricing

import { registry } from "../../src/core/engine";
import { Product } from "./division1.types";

export class Division1Service {
  importProducts(products: Product[]): { imported: number; skipped: number } {
    let imported = 0;
    let skipped = 0;

    for (const p of products) {
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
