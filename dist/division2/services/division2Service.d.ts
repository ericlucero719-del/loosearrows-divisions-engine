import { MultiStoreManager } from "../stores/multiStoreManager";
import { TrackingListener } from "../tracking/trackingListener";
import { PurchaseOrderEngine } from "../po/poEngine";
import { SupplierMatchInput, SupplierMatchResult, SupplierMatchFailure, SupplierInput, StoreRegistryEntry } from "../types";
export declare const storeManager: MultiStoreManager;
export declare const trackingListener: TrackingListener;
export declare const poEngine: PurchaseOrderEngine;
export declare const logs: Array<{
    timestamp: string;
    message: string;
    meta?: unknown;
}>;
export declare function addLog(message: string, meta?: unknown): void;
export declare function getStoreByToken(token: string): Promise<(import("@prisma/client/runtime").GetResult<{
    id: string;
    name: string;
    url: string;
    accessToken: string;
    createdAt: Date;
    updatedAt: Date;
}, unknown> & {}) | null>;
export declare function createStore(entry: StoreRegistryEntry): Promise<import("@prisma/client/runtime").GetResult<{
    id: string;
    name: string;
    url: string;
    accessToken: string;
    createdAt: Date;
    updatedAt: Date;
}, unknown> & {}>;
export declare function updateStoreSettings(storeId: string, settings: Record<string, unknown>): Promise<(import("@prisma/client/runtime").GetResult<{
    id: string;
    storeId: string;
    pricingRulesJson: string | null;
    supplierPriorityJson: string | null;
    shippingRulesJson: string | null;
    automationRulesJson: string | null;
    themePresetsJson: string | null;
    updatedAt: Date;
}, unknown> & {}) | null>;
export declare function loadCatalog(storeId: string, products: any[]): Promise<any[] | null>;
export declare function listSuppliers(storeId?: string): Promise<(import("@prisma/client/runtime").GetResult<{
    id: string;
    name: string;
    contactEmail: string | null;
    apiEndpoint: string | null;
    portalUrl: string | null;
    cost: number;
    stock: number;
    leadTimeDays: number;
    reliabilityScore: number;
    shippingSpeedDays: number;
    location: string | null;
    createdAt: Date;
    updatedAt: Date;
}, unknown> & {})[]>;
export declare function createSupplier(storeId: string, supplier: Partial<SupplierInput>): Promise<import("@prisma/client/runtime").GetResult<{
    id: string;
    name: string;
    contactEmail: string | null;
    apiEndpoint: string | null;
    portalUrl: string | null;
    cost: number;
    stock: number;
    leadTimeDays: number;
    reliabilityScore: number;
    shippingSpeedDays: number;
    location: string | null;
    createdAt: Date;
    updatedAt: Date;
}, unknown> & {}>;
export declare function createOrder(order: any): Promise<{
    items: (import("@prisma/client/runtime").GetResult<{
        id: string;
        orderId: string;
        productId: string;
        quantity: number;
        unitCost: number;
    }, unknown> & {})[];
} & import("@prisma/client/runtime").GetResult<{
    id: string;
    storeId: string;
    customerJson: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}, unknown> & {}>;
export declare function createPurchaseOrderRecord(poData: any): Promise<import("@prisma/client/runtime").GetResult<{
    id: string;
    orderId: string;
    supplierId: string;
    status: string;
    poNumber: string;
    shippingMethod: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}, unknown> & {}>;
export declare function updateTracking(orderId: string, update: any): Promise<import("@prisma/client/runtime").GetResult<{
    id: string;
    orderId: string;
    carrier: string | null;
    trackingNumber: string | null;
    status: string | null;
    eta: Date | null;
    lastScan: Date | null;
    location: string | null;
    updatedAt: Date;
}, unknown> & {}>;
export declare function matchAndSelectSupplier(input: SupplierMatchInput): Promise<{
    match?: SupplierMatchResult;
    failure?: SupplierMatchFailure;
}>;
//# sourceMappingURL=division2Service.d.ts.map