export interface Contract {
    contractId: string;
    contractRef?: string;
    contractName: string;
    agency: string;
    naics?: string;
    periodOfPerformance?: string;
    status: "draft" | "active" | "expired" | "cancelled";
    createdAt: string;
}
export interface ContractProduct {
    contractId: string;
    sku: string;
    clin?: string;
    contractPrice: number;
    notes?: string;
}
export interface ContractCatalogItem {
    sku: string;
    productName: string;
    clin?: string;
    contractPrice: number;
    notes?: string;
}
//# sourceMappingURL=division2.types.d.ts.map