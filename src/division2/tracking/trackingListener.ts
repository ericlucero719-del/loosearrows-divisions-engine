import { TrackingUpdate } from "../types";

export interface NormalizedTracking {
  orderId: string;
  carrier?: string;
  trackingNumber?: string;
  status?: string;
  eta?: string;
  lastScan?: string;
  location?: string;
  updatedAt: string;
}

export class TrackingListener {
  private history: Record<string, NormalizedTracking> = {};

  public normalize(update: TrackingUpdate): NormalizedTracking {
    const now = new Date().toISOString();

    const normalized: NormalizedTracking = {
      orderId: update.orderId,
      carrier: update.carrier,
      trackingNumber: update.trackingNumber,
      status: update.status,
      eta: update.eta,
      lastScan: update.lastScan,
      location: update.location,
      updatedAt: now,
    };

    this.history[update.orderId] = normalized;
    return normalized;
  }

  public getLatest(orderId: string): NormalizedTracking | undefined {
    return this.history[orderId];
  }
}
