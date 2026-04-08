export declare const PRODUCT_CATEGORIES: readonly ["OFFICE_SUPPLIES", "IT_ELECTRONICS", "SAFETY_PPE", "JANITORIAL_FACILITIES", "MEDICAL_HEALTH", "TOOLS_HARDWARE", "FURNITURE_FIXTURES", "UNIFORMS_APPAREL", "FOOD_CATERING", "VEHICLES_EQUIPMENT"];
export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
export interface CategoryMeta {
    id: ProductCategory;
    label: string;
    description: string;
    naics: string;
    productCount: number;
}
export declare const CATEGORY_META: Omit<CategoryMeta, "productCount">[];
export interface Product {
    productName: string;
    sku: string;
    clin?: string;
    naics?: string;
    brand?: string;
    category?: ProductCategory;
    description?: string;
    price: number;
    cost: number;
    margin?: number;
    status: "active" | "inactive" | "pending";
    imageUrl?: string;
    source?: string;
    lastSynced?: string;
}
//# sourceMappingURL=division1.types.d.ts.map