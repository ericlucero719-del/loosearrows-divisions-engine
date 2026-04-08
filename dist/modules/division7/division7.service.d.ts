import { Vendor } from "./division7.types";
export declare class Division7Service {
    createVendor(data: Omit<Vendor, "id" | "linkedContracts" | "linkedRequests" | "createdAt">): Promise<Vendor>;
    listVendors(): Promise<Vendor[]>;
    getVendor(id: string): Promise<Vendor | null>;
    updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | null>;
    attach(id: string, type: "contract" | "request", referenceId: string): Promise<Vendor | null>;
}
export declare const division7Service: Division7Service;
//# sourceMappingURL=division7.service.d.ts.map