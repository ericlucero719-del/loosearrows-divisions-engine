import { StoreRegistryEntry } from "../types";
export declare class MultiStoreManager {
    private stores;
    registerStore(entry: StoreRegistryEntry): StoreRegistryEntry;
    getStore(storeId: string): StoreRegistryEntry | undefined;
    listStores(): StoreRegistryEntry[];
    updateStoreSettings(storeId: string, settings: Record<string, unknown>): StoreRegistryEntry | undefined;
}
//# sourceMappingURL=multiStoreManager.d.ts.map