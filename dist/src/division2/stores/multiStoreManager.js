"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiStoreManager = void 0;
class MultiStoreManager {
    constructor() {
        this.stores = {};
    }
    registerStore(entry) {
        this.stores[entry.storeId] = entry;
        return entry;
    }
    getStore(storeId) {
        return this.stores[storeId];
    }
    listStores() {
        return Object.values(this.stores);
    }
    updateStoreSettings(storeId, settings) {
        const existing = this.stores[storeId];
        if (!existing)
            return undefined;
        existing.settings = {
            ...existing.settings,
            ...settings,
        };
        return existing;
    }
}
exports.MultiStoreManager = MultiStoreManager;
//# sourceMappingURL=multiStoreManager.js.map