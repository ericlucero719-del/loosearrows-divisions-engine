export declare class Division1Service {
    listProducts(category?: string, status?: string): Promise<{
        productId: any;
        sku: any;
        name: any;
        description: any;
        category: any;
        unitOfMeasure: any;
        cost: any;
        price: any;
        marginPct: any;
        naics: any;
        notes: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    getProduct(sku: string): Promise<{
        productId: any;
        sku: any;
        name: any;
        description: any;
        category: any;
        unitOfMeasure: any;
        cost: any;
        price: any;
        marginPct: any;
        naics: any;
        notes: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    createProduct(data: {
        sku: string;
        name: string;
        cost: number;
        price?: number;
        marginBand?: string;
        description?: string;
        category?: string;
        unitOfMeasure?: string;
        naics?: string;
        notes?: string;
    }): Promise<{
        productId: any;
        sku: any;
        name: any;
        description: any;
        category: any;
        unitOfMeasure: any;
        cost: any;
        price: any;
        marginPct: any;
        naics: any;
        notes: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }>;
    updateProduct(sku: string, data: Partial<{
        name: string;
        description: string;
        category: string;
        unitOfMeasure: string;
        cost: number;
        price: number;
        marginBand: string;
        naics: string;
        notes: string;
        status: string;
    }>): Promise<{
        productId: any;
        sku: any;
        name: any;
        description: any;
        category: any;
        unitOfMeasure: any;
        cost: any;
        price: any;
        marginPct: any;
        naics: any;
        notes: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }>;
    deleteProduct(sku: string): Promise<void>;
    priceCalc(sku: string): Promise<{
        sku: string;
        name: string;
        cost: number;
        bands: {
            low: {
                price: number;
                margin: string;
            };
            target: {
                price: number;
                margin: string;
            };
            premium: {
                price: number;
                margin: string;
            };
        };
        current: {
            price: number;
            marginPct: number;
        };
    }>;
    bulkImport(products: Array<{
        sku: string;
        name: string;
        cost: number;
        price?: number;
        marginBand?: string;
        description?: string;
        category?: string;
        unitOfMeasure?: string;
        naics?: string;
        notes?: string;
    }>): Promise<{
        imported: number;
        skipped: number;
        errors: string[];
    }>;
    catalogSummary(): Promise<{
        total: number;
        active: number;
        avgMarginPct: number;
        byCategory: Record<string, number>;
    }>;
}
export declare const division1Service: Division1Service;
//# sourceMappingURL=division1.service.d.ts.map