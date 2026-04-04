// modules/division7/division7.service.ts
// Division 7 — Vendor & Partner Management

import { randomUUID } from "crypto";
import { registry } from "../../src/core/engine";
import { Vendor } from "./division7.types";

export class Division7Service {
  createVendor(data: Omit<Vendor, "id" | "linkedContracts" | "linkedRequests" | "createdAt">): Vendor {
    const vendor: Vendor = {
      ...data,
      id: randomUUID(),
      linkedContracts: [],
      linkedRequests: [],
      createdAt: new Date().toISOString(),
    };
    registry.vendors[vendor.id] = vendor;
    return vendor;
  }

  listVendors(): Vendor[] {
    return Object.values(registry.vendors) as Vendor[];
  }

  getVendor(id: string): Vendor | null {
    return (registry.vendors[id] as Vendor) ?? null;
  }

  updateVendor(id: string, updates: Partial<Vendor>): Vendor | null {
    const vendor = registry.vendors[id] as Vendor;
    if (!vendor) return null;
    Object.assign(vendor, updates);
    return vendor;
  }

  attach(id: string, type: "contract" | "request", referenceId: string): Vendor | null {
    const vendor = registry.vendors[id] as Vendor;
    if (!vendor) return null;

    if (type === "contract" && !vendor.linkedContracts.includes(referenceId)) {
      vendor.linkedContracts.push(referenceId);
    }
    if (type === "request" && !vendor.linkedRequests.includes(referenceId)) {
      vendor.linkedRequests.push(referenceId);
    }
    return vendor;
  }
}

export const division7Service = new Division7Service();
