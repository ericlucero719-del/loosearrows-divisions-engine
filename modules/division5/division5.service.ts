// modules/division5/division5.service.ts
// Division 5 — Logistics & Fulfillment

import { randomUUID } from "crypto";
import { registry } from "../../src/core/engine";
import { Shipment, ShipmentStatus, ShipmentItem } from "./division5.types";

export class Division5Service {
  createShipment(data: {
    requestId?: string;
    contractId?: string;
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    items: ShipmentItem[];
  }): Shipment {
    const now = new Date().toISOString();
    const shipment: Shipment = {
      id: randomUUID(),
      status: "Pending",
      items: data.items,
      requestId: data.requestId,
      contractId: data.contractId,
      carrier: data.carrier,
      trackingNumber: data.trackingNumber,
      estimatedDelivery: data.estimatedDelivery,
      createdAt: now,
      updatedAt: now,
    };
    registry.shipments[shipment.id] = shipment;
    return shipment;
  }

  updateStatus(id: string, status: ShipmentStatus): Shipment | null {
    const shipment = registry.shipments[id] as Shipment;
    if (!shipment) return null;
    shipment.status = status;
    shipment.updatedAt = new Date().toISOString();
    return shipment;
  }

  listShipments(filter?: { contractId?: string; requestId?: string }): Shipment[] {
    const all = Object.values(registry.shipments) as Shipment[];
    if (!filter) return all;
    return all.filter((s) => {
      if (filter.contractId && s.contractId !== filter.contractId) return false;
      if (filter.requestId && s.requestId !== filter.requestId) return false;
      return true;
    });
  }

  getShipment(id: string): Shipment | null {
    return (registry.shipments[id] as Shipment) ?? null;
  }
}

export const division5Service = new Division5Service();
