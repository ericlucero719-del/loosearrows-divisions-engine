"use strict";
// modules/division2/division2.service.ts
// Division 2 — Contract Alignment (PostgreSQL-backed)
Object.defineProperty(exports, "__esModule", { value: true });
exports.division2Service = exports.Division2Service = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function toContract(row) {
    return {
        contractId: row.contractId,
        contractRef: row.contractRef ?? undefined,
        contractName: row.contractName,
        agency: row.agency,
        naics: row.naics ?? undefined,
        periodOfPerformance: row.periodOfPerformance ?? undefined,
        status: row.status,
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
        products: (row.products ?? []).map((p) => ({
            contractId: p.contractId,
            sku: p.sku,
            clin: p.clin ?? undefined,
            contractPrice: p.contractPrice,
            notes: p.notes ?? undefined,
        })),
    };
}
class Division2Service {
    async resolve(idOrRef) {
        return prisma.govContract.findFirst({
            where: { OR: [{ contractId: idOrRef }, { contractRef: idOrRef }] },
            include: { products: true },
        });
    }
    async createContract(data) {
        const row = await prisma.govContract.create({
            data: {
                contractId: data.contractId ?? undefined,
                contractRef: data.contractRef ?? null,
                contractName: data.contractName,
                agency: data.agency,
                naics: data.naics ?? null,
                psc: data.psc ?? null,
                setAside: data.setAside ?? null,
                periodOfPerformance: data.periodOfPerformance ?? null,
                status: data.status ?? "draft",
            },
            include: { products: true },
        });
        return toContract(row);
    }
    async listContracts() {
        const rows = await prisma.govContract.findMany({ orderBy: { createdAt: "asc" }, include: { products: true } });
        return rows.map(r => { const { products: _p, ...c } = toContract(r); return c; });
    }
    async getContract(idOrRef) {
        const row = await this.resolve(idOrRef);
        return row ? toContract(row) : null;
    }
    async addProductToContract(idOrRef, item) {
        const contract = await this.resolve(idOrRef);
        if (!contract)
            return null;
        const row = await prisma.govContractProduct.upsert({
            where: { contractId_sku: { contractId: contract.contractId, sku: item.sku } },
            update: { clin: item.clin ?? null, contractPrice: item.contractPrice, notes: item.notes ?? null },
            create: { contractId: contract.contractId, sku: item.sku, clin: item.clin ?? null, contractPrice: item.contractPrice, notes: item.notes ?? null },
        });
        return { contractId: row.contractId, sku: row.sku, clin: row.clin ?? undefined, contractPrice: row.contractPrice, notes: row.notes ?? undefined };
    }
    async updateContract(idOrRef, updates) {
        const contract = await this.resolve(idOrRef);
        if (!contract)
            return null;
        const row = await prisma.govContract.update({
            where: { contractId: contract.contractId },
            data: { ...updates, periodOfPerformance: updates.periodOfPerformance ?? undefined },
            include: { products: true },
        });
        return toContract(row);
    }
    async getContractCatalog(idOrRef) {
        const contract = await this.resolve(idOrRef);
        if (!contract)
            return null;
        return contract.products.map((cp) => ({
            sku: cp.sku,
            productName: cp.sku,
            clin: cp.clin ?? undefined,
            contractPrice: cp.contractPrice,
            notes: cp.notes ?? undefined,
        }));
    }
}
exports.Division2Service = Division2Service;
exports.division2Service = new Division2Service();
//# sourceMappingURL=division2.service.js.map