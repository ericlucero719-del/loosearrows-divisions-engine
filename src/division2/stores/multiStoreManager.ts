import { StoreRegistryEntry } from "../types";

export class MultiStoreManager {
  private stores: Record<string, StoreRegistryEntry> = {};

  public registerStore(entry: StoreRegistryEntry): StoreRegistryEntry {
    this.stores[entry.storeId] = entry;
    return entry;
  }

  public getStore(storeId: string): StoreRegistryEntry | undefined {
    return this.stores[storeId];
  }

  public listStores(): StoreRegistryEntry[] {
    return Object.values(this.stores);
  }

  public updateStoreSettings(storeId: string, settings: Record<string, unknown>): StoreRegistryEntry | undefined {
    const existing = this.stores[storeId];
    if (!existing) return undefined;
    existing.settings = {
      ...existing.settings,
      ...settings,
    };
    return existing;
  }
}
