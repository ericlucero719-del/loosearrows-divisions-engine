// modules/division5/division5.types.ts
// Division 5 — Logistics & Fulfillment

export type ShipmentStatus =
  | "Pending"
  | "Picked"
  | "In Transit"
  | "Delivered"
  | "Returned"
  | "Cancelled";

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
