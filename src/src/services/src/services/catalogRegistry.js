// src/services/catalogRegistry.js

/**
 * Simple in-memory catalog registry.
 * Each store gets its own catalog stored by storeId.
 * This keeps Division 2 stateless and fast.
 */

const registry = {};

/**
 * Save catalog for a store
 */
function saveCatalog(storeId, items) {
  registry[storeId] = {
    items,
    updatedAt: new Date().toISOString(),
  };
  return registry[storeId];
}

/**
 * Get catalog for a store
 */
function getCatalog(storeId) {
  return registry[storeId] || null;
}

module.exports = {
  saveCatalog,
  getCatalog,
};
