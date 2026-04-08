export interface Vendor {
    id: string;
    name: string;
    categories: string[];
    capabilities: string[];
    performanceNotes?: string;
    contactEmail?: string;
    status: "active" | "inactive" | "pending";
    linkedContracts: string[];
    linkedRequests: string[];
    createdAt: string;
}
//# sourceMappingURL=division7.types.d.ts.map