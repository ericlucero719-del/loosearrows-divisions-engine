// modules/division1/division1.types.ts
// Division 1 — Product Intake & Pricing

export interface Product {
  productName: string;
  sku: string;
  clin?: string;
  naics?: string;
  brand?: string;
  category?: string;
  description?: string;
  price: number;
  cost: number;
  margin?: number;
  status: "active" | "inactive" | "pending";
  imageUrl?: string;
  source?: string;
  lastSynced?: string;
}
