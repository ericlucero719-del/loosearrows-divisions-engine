export type ShipmentStatus = "Pending" | "Picked" | "In Transit" | "Out for Delivery" | "Delivered" | "Returned" | "Cancelled";
export declare const STATUS_ALIASES: Record<string, ShipmentStatus>;
export declare function normalizeStatus(raw: string): ShipmentStatus | null;
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
//# sourceMappingURL=division5.types.d.ts.map