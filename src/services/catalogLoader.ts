export interface ShopifyProduct {
  id: string;
  title: string;
  body_html?: string;
  variants?: Array<{
    sku: string;
    price: string;
    compare_at_price?: string;
  }>;
  images?: Array<{ src: string }>;
}

export interface NormalizedProduct {
  sku: string;
  title: string;
  description?: string;
  price: number;
  cost: number;
  images: string[];
}

export async function fetchShopifyProducts(opts: {
  storeDomain: string;
  accessToken: string;
}): Promise<{ ok: boolean; products: ShopifyProduct[]; error?: string }> {
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

    const data = (await res.json()) as { products: ShopifyProduct[] };
    return { ok: true, products: data.products ?? [] };
  } catch (err: any) {
    return { ok: false, products: [], error: err.message };
  }
}

export function normalizeProduct(product: ShopifyProduct): NormalizedProduct {
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
