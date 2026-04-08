export interface InventoryItem {
    sku: string;
    onHand: number;
    allocated: number;
    available: number;
    warehouseLocation?: string;
    reorderPoint?: number;
    vendorLeadTimeDays?: number;
    updatedAt: string;
}
export interface AllocationRequest {
    sku: string;
    quantity: number;
    referenceId: string;
    referenceType: "contract" | "request";
}
//# sourceMappingURL=division4.types.d.ts.map