// modules/division4/division4.service.ts
// Division 4 — Inventory & Assets

import { registry } from "../../src/core/engine";
import { InventoryItem, AllocationRequest } from "./division4.types";

export class Division4Service {
  getInventory(sku: string): InventoryItem | null {
    return (registry.inventory[sku] as InventoryItem) ?? null;
  }

  upsertInventory(data: Partial<InventoryItem> & { sku: string }): InventoryItem {
    const existing = (registry.inventory[data.sku] as InventoryItem) ?? {
      sku: data.sku,
      onHand: 0,
      allocated: 0,
      available: 0,
      updatedAt: new Date().toISOString(),
    };

    const updated: InventoryItem = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    updated.available = updated.onHand - updated.allocated;
    registry.inventory[updated.sku] = updated;
    return updated;
  }

  allocate(req: AllocationRequest): { success: boolean; item?: InventoryItem; error?: string } {
    const item = registry.inventory[req.sku] as InventoryItem;
    if (!item) return { success: false, error: "SKU not found" };
    if (item.available < req.quantity) {
      return { success: false, error: `Insufficient stock: ${item.available} available` };
    }

    item.allocated += req.quantity;
    item.available = item.onHand - item.allocated;
    item.updatedAt = new Date().toISOString();
    return { success: true, item };
  }

  release(sku: string, quantity: number): { success: boolean; item?: InventoryItem; error?: string } {
    const item = registry.inventory[sku] as InventoryItem;
    if (!item) return { success: false, error: "SKU not found" };
    if (item.allocated < quantity) {
      return { success: false, error: `Cannot release more than allocated: ${item.allocated}` };
    }

    item.allocated -= quantity;
    item.available = item.onHand - item.allocated;
    item.updatedAt = new Date().toISOString();
    return { success: true, item };
  }

  listInventory(): InventoryItem[] {
    return Object.values(registry.inventory) as InventoryItem[];
  }
}

export const division4Service = new Division4Service();
