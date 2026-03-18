// src/services/catalogLoader.js

const fetch = require('node-fetch');

/**
 * Fetch products from Shopify Admin API
 */
async function fetchShopifyProducts({ storeDomain, accessToken }) {
  const url = `https://${storeDomain}/admin/api/2024-01/products.json?limit=250`;

  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return { ok: false, status: response.status, error: await response.text() };
  }

  const data = await response.json();

  return {
    ok: true,
    products: data.products || [],
  };
}

/**
 * Normalize Shopify product into your engine format
 */
function normalizeProduct(p) {
  return {
    id: p.id,
    title: p.title,
    bodyHtml: p.body_html,
    vendor: p.vendor,
    productType: p.product_type,
    tags: p.tags,
    variants: p.variants.map(v => ({
      id: v.id,
      sku: v.sku,
      price: v.price,
      inventory: v.inventory_quantity,
    })),
    images: p.images.map(img => img.src),
  };
}

module.exports = {
  fetchShopifyProducts,
  normalizeProduct,
};
