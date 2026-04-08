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
export declare class TrackingListener {
    private history;
    normalize(update: TrackingUpdate): NormalizedTracking;
    getLatest(orderId: string): NormalizedTracking | undefined;
}
//# sourceMappingURL=trackingListener.d.ts.map