import { z } from "zod";

export const storeRegisterSchema = z.object({
  storeId: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url(),
  accessToken: z.string().optional(),
});

export const storeSettingsSchema = z.object({
  settings: z.record(z.string(), z.unknown()),
});

export const loadCatalogSchema = z.object({
  products: z.array(
    z.object({
      sku: z.string().min(1),
      title: z.string().optional(),
      description: z.string().optional(),
      images: z.array(z.string()).optional(),
      cost: z.number().optional(),
      price: z.number().optional(),
    })
  ),
});

export const createSupplierSchema = z.object({
  supplier: z.object({
    name: z.string().min(1),
    sku: z.string().optional(),
    cost: z.number().optional(),
    shippingSpeedDays: z.number().optional(),
    location: z.string().optional(),
    distanceKm: z.number().optional(),
    stock: z.number().optional(),
    reliabilityScore: z.number().min(0).max(1).optional(),
    leadTimeDays: z.number().optional(),
    contactEmail: z.string().email().optional(),
    apiEndpoint: z.string().url().optional(),
    portalUrl: z.string().url().optional(),
  }),
});

const addressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

export const purchaseOrderRequestSchema = z.object({
  orderId: z.string().min(1),
  storeId: z.string().min(1),
  customer: z.object({
    name: z.string().min(1),
    address: addressSchema,
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
  lineItems: z.array(
    z.object({
      sku: z.string().min(1),
      quantity: z.number().int().positive(),
      unitCost: z.number().nonnegative(),
      title: z.string().optional(),
    })
  ),
  shippingMethod: z.string().optional(),
  notes: z.string().optional(),
});

export const supplierMatchInputSchema = z.object({
  sku: z.string().min(1),
  quantity: z.number().int().positive(),
  suppliers: z.array(z.any()).min(1),
  marginRules: z.any().optional(),
  priorityRules: z.any().optional(),
  customerLocation: z.any().optional(),
});

export const trackingUpdateSchema = z.object({
  orderId: z.string().min(1),
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  status: z.string().optional(),
  eta: z.string().optional(),
  lastScan: z.string().optional(),
  location: z.string().optional(),
});
