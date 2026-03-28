import { z } from "zod";
export declare const storeRegisterSchema: z.ZodObject<{
    storeId: z.ZodString;
    name: z.ZodString;
    url: z.ZodString;
    accessToken: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const storeSettingsSchema: z.ZodObject<{
    settings: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;
export declare const loadCatalogSchema: z.ZodObject<{
    products: z.ZodArray<z.ZodObject<{
        sku: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        images: z.ZodOptional<z.ZodArray<z.ZodString>>;
        cost: z.ZodOptional<z.ZodNumber>;
        price: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const createSupplierSchema: z.ZodObject<{
    supplier: z.ZodObject<{
        name: z.ZodString;
        sku: z.ZodOptional<z.ZodString>;
        cost: z.ZodOptional<z.ZodNumber>;
        shippingSpeedDays: z.ZodOptional<z.ZodNumber>;
        location: z.ZodOptional<z.ZodString>;
        distanceKm: z.ZodOptional<z.ZodNumber>;
        stock: z.ZodOptional<z.ZodNumber>;
        reliabilityScore: z.ZodOptional<z.ZodNumber>;
        leadTimeDays: z.ZodOptional<z.ZodNumber>;
        contactEmail: z.ZodOptional<z.ZodString>;
        apiEndpoint: z.ZodOptional<z.ZodString>;
        portalUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const purchaseOrderRequestSchema: z.ZodObject<{
    orderId: z.ZodString;
    storeId: z.ZodString;
    customer: z.ZodObject<{
        name: z.ZodString;
        address: z.ZodObject<{
            line1: z.ZodString;
            line2: z.ZodOptional<z.ZodString>;
            city: z.ZodString;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodString;
            country: z.ZodString;
        }, z.core.$strip>;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    lineItems: z.ZodArray<z.ZodObject<{
        sku: z.ZodString;
        quantity: z.ZodNumber;
        unitCost: z.ZodNumber;
        title: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    shippingMethod: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const supplierMatchInputSchema: z.ZodObject<{
    sku: z.ZodString;
    quantity: z.ZodNumber;
    suppliers: z.ZodArray<z.ZodAny>;
    marginRules: z.ZodOptional<z.ZodAny>;
    priorityRules: z.ZodOptional<z.ZodAny>;
    customerLocation: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const trackingUpdateSchema: z.ZodObject<{
    orderId: z.ZodString;
    carrier: z.ZodOptional<z.ZodString>;
    trackingNumber: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    eta: z.ZodOptional<z.ZodString>;
    lastScan: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=schemas.d.ts.map