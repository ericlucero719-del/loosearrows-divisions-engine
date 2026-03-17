// Shared types for Division 2 (Loose Arrows)

export type SupplierContactMethod = "email" | "api" | "portal";

export interface MarginRule {
  minMarginPercent: number;
  maxMarginPercent: number;
  defaultMarginPercent: number;
}

export interface PriorityRule {
  supplierId: string;
  priority: number; // lower = higher priority
}

export interface SupplierInput {
  id: string;
  name: string;
  sku: string;
  cost: number;
  shippingSpeedDays: number; // lower is faster
  location?: string;
  distanceKm?: number; // optional
  stock: number;
  reliabilityScore: number; // 0-1
  leadTimeDays: number;
  contactEmail?: string;
  apiEndpoint?: string;
  portalUrl?: string;
}

export interface SupplierMatchInput {
  sku: string;
  quantity: number;
  suppliers: SupplierInput[];
  marginRules?: MarginRule;
  priorityRules?: PriorityRule[];
  customerLocation?: {
    country?: string;
    region?: string;
    postalCode?: string;
  };
}

export interface SupplierMatchResult {
  supplierId: string;
  supplierName: string;
  supplierSku: string;
  supplierCost: number;
  supplierShippingMethod: string;
  supplierLeadTimeDays: number;
  supplierContactMethod: SupplierContactMethod;
  score: number;
  rationale: {
    costScore: number;
    speedScore: number;
    stockScore: number;
    distanceScore: number;
    reliabilityScore: number;
  };
}

export interface SupplierMatchFailure {
  reason: "no-stock" | "api-failure" | "manual-review";
  message: string;
  attemptedSupplierIds: string[];
}

export interface PurchaseOrderRequest {
  orderId: string;
  storeId: string;
  customer: {
    name: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postalCode: string;
      country: string;
    };
    email?: string;
    phone?: string;
  };
  lineItems: Array<{
    sku: string;
    quantity: number;
    unitCost: number;
    title?: string;
  }>;
  shippingMethod?: string;
  notes?: string;
}

export interface PoEngineResult {
  poNumber: string;
  status: "created" | "sent" | "failed";
  supplierResponse?: unknown;
  errors?: string[];
}

export interface TrackingUpdate {
  orderId: string;
  carrier?: string;
  trackingNumber?: string;
  status?: string;
  eta?: string;
  lastScan?: string;
  location?: string;
}

export interface StoreRegistryEntry {
  storeId: string;
  name: string;
  url: string;
  accessToken?: string; // optional; auto-generated if not provided
  catalog?: string[];
  suppliers?: string[];
  settings?: Record<string, unknown>;
}
