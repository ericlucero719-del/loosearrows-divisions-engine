// modules/division5/division5.types.ts
// Division 5 — Logistics & Fulfillment

export type ShipmentStatus =
  | "Pending"
  | "Picked"
  | "In Transit"
  | "Out for Delivery"
  | "Delivered"
  | "Returned"
  | "Cancelled";

// Accept camelCase or spaced variants from callers
export const STATUS_ALIASES: Record<string, ShipmentStatus> = {
  outfordelivery:   "Out for Delivery",
  "out for delivery": "Out for Delivery",
  intransit:        "In Transit",
  "in transit":     "In Transit",
  pending:          "Pending",
  picked:           "Picked",
  delivered:        "Delivered",
  returned:         "Returned",
  cancelled:        "Cancelled",
};

export function normalizeStatus(raw: string): ShipmentStatus | null {
  return STATUS_ALIASES[raw.toLowerCase()] ?? null;
}

export interface ShipmentItem {
  sku: string;
  quantity: number;
}

export interface Shipment {
  id: string;
  requestId?: string;
  contractId?: string;
  status: ShipmentStatus;
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  items: ShipmentItem[];
  createdAt: string;
  updatedAt: string;
}
