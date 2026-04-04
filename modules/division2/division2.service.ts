// modules/division2/division2.service.ts
// Division 2 — Contract Alignment

import { randomUUID } from "crypto";
import { registry } from "../../src/core/engine";
import { Contract, ContractProduct, ContractCatalogItem } from "./division2.types";

export class Division2Service {
  createContract(data: Omit<Contract, "contractId" | "createdAt">): Contract {
    const contract: Contract = {
      ...data,
      contractId: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    registry.contracts[contract.contractId] = { ...contract, products: [] };
    return contract;
  }

  listContracts(): Contract[] {
    return Object.values(registry.contracts).map(({ products: _p, ...c }) => c) as Contract[];
  }

  getContract(contractId: string): (Contract & { products: ContractProduct[] }) | null {
    return (registry.contracts[contractId] as any) ?? null;
  }

  addProductToContract(contractId: string, item: Omit<ContractProduct, "contractId">): ContractProduct | null {
    const contract = registry.contracts[contractId];
    if (!contract) return null;

    const cp: ContractProduct = { ...item, contractId };
    const existing = contract.products.findIndex((p: any) => p.sku === item.sku);
    if (existing !== -1) {
      contract.products[existing] = cp;
    } else {
      contract.products.push(cp);
    }
    return cp;
  }

  updateContract(contractId: string, updates: Partial<Pick<Contract, "status" | "contractName" | "agency" | "naics" | "periodOfPerformance">>): Contract | null {
    const contract = registry.contracts[contractId];
    if (!contract) return null;
    Object.assign(contract, updates);
    return contract;
  }

  getContractCatalog(contractId: string): ContractCatalogItem[] | null {
    const contract = registry.contracts[contractId];
    if (!contract) return null;

    return contract.products.map((cp: ContractProduct): ContractCatalogItem => {
      const product = registry.products[cp.sku];
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
