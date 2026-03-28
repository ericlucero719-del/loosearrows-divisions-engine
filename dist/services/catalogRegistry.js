"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCatalog = saveCatalog;
exports.getCatalog = getCatalog;
const catalog = new Map();
function saveCatalog(storeId, products) {
    catalog.set(storeId, products);
    return products;
}
function getCatalog(storeId) {
    return catalog.get(storeId) ?? [];
}
//# sourceMappingURL=catalogRegistry.js.map