"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchShopifyProducts = fetchShopifyProducts;
exports.normalizeProduct = normalizeProduct;
async function fetchShopifyProducts(opts) {
    try {
        const url = `https://${opts.storeDomain}/admin/api/2023-10/products.json`;
        const res = await fetch(url, {
            headers: {
                'X-Shopify-Access-Token': opts.accessToken,
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            return { ok: false, products: [], error: `HTTP ${res.status}` };
        }
        const data = (await res.json());
        return { ok: true, products: data.products ?? [] };
    }
    catch (err) {
        return { ok: false, products: [], error: err.message };
    }
}
function normalizeProduct(product) {
    const variant = product.variants?.[0];
    return {
        sku: variant?.sku ?? product.id,
        title: product.title,
        description: product.body_html ?? undefined,
        price: parseFloat(variant?.price ?? '0'),
        cost: parseFloat(variant?.compare_at_price ?? variant?.price ?? '0'),
        images: (product.images ?? []).map((img) => img.src),
    };
}
//# sourceMappingURL=catalogLoader.js.map