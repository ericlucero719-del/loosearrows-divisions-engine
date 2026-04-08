export interface ShopifyProduct {
    id: string;
    title: string;
    body_html?: string;
    variants?: Array<{
        sku: string;
        price: string;
        compare_at_price?: string;
    }>;
    images?: Array<{
        src: string;
    }>;
}
export interface NormalizedProduct {
    sku: string;
    title: string;
    description?: string;
    price: number;
    cost: number;
    images: string[];
}
export declare function fetchShopifyProducts(opts: {
    storeDomain: string;
    accessToken: string;
}): Promise<{
    ok: boolean;
    products: ShopifyProduct[];
    error?: string;
}>;
export declare function normalizeProduct(product: ShopifyProduct): NormalizedProduct;
//# sourceMappingURL=catalogLoader.d.ts.map