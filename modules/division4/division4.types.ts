// modules/division4/division4.types.ts
// Division 4 — Inventory & Assets

export interface InventoryItem {
  sku: string;
  onHand: number;
  allocated: number;
  available: number;
  warehouseLocation?: string;
  reorderPoint?: number;
  vendorLeadTimeDays?: number;
  updatedAt: string;
}

export interface AllocationRequest {
  sku: string;
  quantity: number;
  referenceId: string; // contractId or requestId
  referenceType: "contract" | "request";
}
