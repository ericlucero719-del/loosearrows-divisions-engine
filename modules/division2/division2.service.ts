// modules/division2/division2.service.ts
// Division 2 — Contract Alignment (PostgreSQL-backed)

import { PrismaClient } from "@prisma/client";
import { Contract, ContractProduct, ContractCatalogItem } from "./division2.types";

const prisma = new PrismaClient();

function toContract(row: any): Contract & { products: ContractProduct[] } {
  return {
    contractId:           row.contractId,
    contractRef:          row.contractRef  ?? undefined,
    contractName:         row.contractName,
    agency:               row.agency,
    naics:                row.naics         ?? undefined,
    periodOfPerformance:  row.periodOfPerformance ?? undefined,
    status:               row.status as Contract["status"],
    createdAt:            row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    products:             (row.products ?? []).map((p: any): ContractProduct => ({
      contractId:    p.contractId,
      sku:           p.sku,
      clin:          p.clin ?? undefined,
      contractPrice: p.contractPrice,
      notes:         p.notes ?? undefined,
    })),
  };
}

export class Division2Service {
  private async resolve(idOrRef: string) {
    return prisma.govContract.findFirst({
      where: { OR: [{ contractId: idOrRef }, { contractRef: idOrRef }] },
      include: { products: true },
    });
  }

  async createContract(data: Omit<Contract, "contractId" | "createdAt"> & { contractId?: string }): Promise<Contract> {
    const row = await prisma.govContract.create({
      data: {
        contractId:           data.contractId ?? undefined,
        contractRef:          data.contractRef ?? null,
        contractName:         data.contractName,
        agency:               data.agency,
        naics:                data.naics ?? null,
        psc:                  (data as any).psc ?? null,
        setAside:             (data as any).setAside ?? null,
        periodOfPerformance:  data.periodOfPerformance ?? null,
        status:               data.status ?? "draft",
      },
      include: { products: true },
    });
    return toContract(row);
  }

  async listContracts(): Promise<Contract[]> {
    const rows = await prisma.govContract.findMany({ orderBy: { createdAt: "asc" }, include: { products: true } });
    return rows.map(r => { const { products: _p, ...c } = toContract(r); return c as Contract; });
  }

  async getContract(idOrRef: string): Promise<(Contract & { products: ContractProduct[] }) | null> {
    const row = await this.resolve(idOrRef);
    return row ? toContract(row) : null;
  }

  async addProductToContract(idOrRef: string, item: Omit<ContractProduct, "contractId">): Promise<ContractProduct | null> {
    const contract = await this.resolve(idOrRef);
    if (!contract) return null;
    const row = await prisma.govContractProduct.upsert({
      where:  { contractId_sku: { contractId: contract.contractId, sku: item.sku } },
      update: { clin: item.clin ?? null, contractPrice: item.contractPrice, notes: item.notes ?? null },
      create: { contractId: contract.contractId, sku: item.sku, clin: item.clin ?? null, contractPrice: item.contractPrice, notes: item.notes ?? null },
    });
    return { contractId: row.contractId, sku: row.sku, clin: row.clin ?? undefined, contractPrice: row.contractPrice, notes: row.notes ?? undefined };
  }

  async updateContract(idOrRef: string, updates: Partial<Pick<Contract, "status" | "contractName" | "agency" | "naics" | "periodOfPerformance" | "contractRef">>): Promise<Contract | null> {
    const contract = await this.resolve(idOrRef);
    if (!contract) return null;
    const row = await prisma.govContract.update({
      where:   { contractId: contract.contractId },
      data:    { ...updates, periodOfPerformance: updates.periodOfPerformance ?? undefined },
      include: { products: true },
    });
    return toContract(row);
  }

  async getContractCatalog(idOrRef: string): Promise<ContractCatalogItem[] | null> {
    const contract = await this.resolve(idOrRef);
    if (!contract) return null;
    return contract.products.map((cp): ContractCatalogItem => ({
      sku:           cp.sku,
      productName:   cp.sku,
      clin:          cp.clin ?? undefined,
      contractPrice: cp.contractPrice,
      notes:         cp.notes ?? undefined,
    }));
  }
}

export const division2Service = new Division2Service();
