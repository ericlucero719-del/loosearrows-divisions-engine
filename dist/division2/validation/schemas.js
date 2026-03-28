"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackingUpdateSchema = exports.supplierMatchInputSchema = exports.purchaseOrderRequestSchema = exports.createSupplierSchema = exports.loadCatalogSchema = exports.storeSettingsSchema = exports.storeRegisterSchema = void 0;
const zod_1 = require("zod");
exports.storeRegisterSchema = zod_1.z.object({
    storeId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    url: zod_1.z.string().url(),
    accessToken: zod_1.z.string().optional(),
});
exports.storeSettingsSchema = zod_1.z.object({
    settings: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
});
exports.loadCatalogSchema = zod_1.z.object({
    products: zod_1.z.array(zod_1.z.object({
        sku: zod_1.z.string().min(1),
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        images: zod_1.z.array(zod_1.z.string()).optional(),
        cost: zod_1.z.number().optional(),
        price: zod_1.z.number().optional(),
    })),
});
exports.createSupplierSchema = zod_1.z.object({
    supplier: zod_1.z.object({
        name: zod_1.z.string().min(1),
        sku: zod_1.z.string().optional(),
        cost: zod_1.z.number().optional(),
        shippingSpeedDays: zod_1.z.number().optional(),
        location: zod_1.z.string().optional(),
        distanceKm: zod_1.z.number().optional(),
        stock: zod_1.z.number().optional(),
        reliabilityScore: zod_1.z.number().min(0).max(1).optional(),
        leadTimeDays: zod_1.z.number().optional(),
        contactEmail: zod_1.z.string().email().optional(),
        apiEndpoint: zod_1.z.string().url().optional(),
        portalUrl: zod_1.z.string().url().optional(),
    }),
});
const addressSchema = zod_1.z.object({
    line1: zod_1.z.string().min(1),
    line2: zod_1.z.string().optional(),
    city: zod_1.z.string().min(1),
    state: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().min(1),
    country: zod_1.z.string().min(1),
});
exports.purchaseOrderRequestSchema = zod_1.z.object({
    orderId: zod_1.z.string().min(1),
    storeId: zod_1.z.string().min(1),
    customer: zod_1.z.object({
        name: zod_1.z.string().min(1),
        address: addressSchema,
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().optional(),
    }),
    lineItems: zod_1.z.array(zod_1.z.object({
        sku: zod_1.z.string().min(1),
        quantity: zod_1.z.number().int().positive(),
        unitCost: zod_1.z.number().nonnegative(),
        title: zod_1.z.string().optional(),
    })),
    shippingMethod: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.supplierMatchInputSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().positive(),
    suppliers: zod_1.z.array(zod_1.z.any()).min(1),
    marginRules: zod_1.z.any().optional(),
    priorityRules: zod_1.z.any().optional(),
    customerLocation: zod_1.z.any().optional(),
});
exports.trackingUpdateSchema = zod_1.z.object({
    orderId: zod_1.z.string().min(1),
    carrier: zod_1.z.string().optional(),
    trackingNumber: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    eta: zod_1.z.string().optional(),
    lastScan: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
});
//# sourceMappingURL=schemas.js.map