// modules/division2/division2.types.ts
// Division 2 — Contract Alignment

export interface Contract {
  contractId: string;
  contractRef?: string;       // human-readable reference, e.g. "VA-BPA-001"
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
  contractPrice: number;
  notes?: string;
}

export interface ContractCatalogItem {
  sku: string;
  productName: string;
  contractPrice: number;
  notes?: string;
}
