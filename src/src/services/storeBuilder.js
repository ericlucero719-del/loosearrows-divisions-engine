// src/services/storeBuilder.js

/**
 * Store Builder Engine
 * --------------------
 * Takes a loaded catalog and produces a "store build plan":
 * - filtered product list
 * - normalized Shopify-ready product objects
 * - ready for pushing to Shopify (future step)
 */

function buildStoreFromCatalog({ store, catalog, options = {} }) {
  const { includeVendors, excludeVendors, maxProducts } = options;

  // Catalog may be stored as { items: [...] } or directly as an array
  let items = catalog.items || catalog;

  // Filter: include only specific vendors
  if (includeVendors && includeVendors.length) {
    items = items.filter((p) => includeVendors.includes(p.vendor));
  }

  // Filter: exclude specific vendors
  if (excludeVendors && excludeVendors.length) {
    items = items.filter((p) => !excludeVendors.includes(p.vendor));
  }

  // Limit number of products
  if (maxProducts && Number.isInteger(maxProducts)) {
    items = items.slice(0, maxProducts);
  }

  // Convert catalog items into Shopify-ready product objects
  const products = items.map((p) => ({
    title: p.title,
    body_html: p.bodyHtml,
    vendor: p.vendor,
    product_type: p.productType,
    tags: p.tags,
    variants: p.variants.map((v) => ({
      sku: v.sku,
      price: v.price,
      inventory_quantity: v.inventory,
    })),
    images: p.images.map((src) => ({ src })),
  }));

  return {
    storeId: store.id,
    productCount: products.length,
    products,
  };
}

module.exports = {
  buildStoreFromCatalog,
};
