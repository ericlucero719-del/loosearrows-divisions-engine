// modules/division2/division2.service.ts
// Division 2 — Contract Alignment

import { randomUUID } from "crypto";
import { registry } from "../../src/core/engine";
import { Contract, ContractProduct, ContractCatalogItem } from "./division2.types";

export class Division2Service {
  // Resolve by contractId (UUID) or contractRef ("VA-BPA-001")
  private resolve(idOrRef: string): any | null {
    if (registry.contracts[idOrRef]) return registry.contracts[idOrRef];
    return Object.values(registry.contracts).find((c: any) => c.contractRef === idOrRef) ?? null;
  }

  createContract(data: Omit<Contract, "contractId" | "createdAt"> & { contractId?: string }): Contract {
    const contractId = data.contractId ?? randomUUID();
    const contract: Contract = {
      ...data,
      contractId,
      createdAt: new Date().toISOString(),
    };
    registry.contracts[contractId] = { ...contract, products: [] };
    return contract;
  }

  listContracts(): Contract[] {
    return Object.values(registry.contracts).map(({ products: _p, ...c }) => c) as Contract[];
  }

  getContract(idOrRef: string): (Contract & { products: ContractProduct[] }) | null {
    return this.resolve(idOrRef) ?? null;
  }

  addProductToContract(idOrRef: string, item: Omit<ContractProduct, "contractId">): ContractProduct | null {
    const contract = this.resolve(idOrRef);
    if (!contract) return null;
    const contractId = contract.contractId;

    const cp: ContractProduct = { sku: item.sku, clin: item.clin, contractPrice: item.contractPrice, notes: item.notes, contractId };
    const existing = contract.products.findIndex((p: any) => p.sku === item.sku);
    if (existing !== -1) {
      contract.products[existing] = cp;
    } else {
      contract.products.push(cp);
    }
    return cp;
  }

  updateContract(idOrRef: string, updates: Partial<Pick<Contract, "status" | "contractName" | "agency" | "naics" | "periodOfPerformance" | "contractRef">>): Contract | null {
    const contract = this.resolve(idOrRef);
    if (!contract) return null;
    Object.assign(contract, updates);
    return contract;
  }

  getContractCatalog(idOrRef: string): ContractCatalogItem[] | null {
    const contract = this.resolve(idOrRef);
    if (!contract) return null;

    return contract.products.map((cp: ContractProduct): ContractCatalogItem => {
      const product = registry.products[cp.sku] as any;
      return {
        sku: cp.sku,
        productName: product?.productName ?? "Unknown",
        contractPrice: cp.contractPrice,
        notes: cp.notes,
      };
    });
  }
}

export const division2Service = new Division2Service();
