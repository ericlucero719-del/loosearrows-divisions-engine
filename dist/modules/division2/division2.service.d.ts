import { Contract, ContractProduct, ContractCatalogItem } from "./division2.types";
export declare class Division2Service {
    private resolve;
    createContract(data: Omit<Contract, "contractId" | "createdAt"> & {
        contractId?: string;
    }): Promise<Contract>;
    listContracts(): Promise<Contract[]>;
    getContract(idOrRef: string): Promise<(Contract & {
        products: ContractProduct[];
    }) | null>;
    addProductToContract(idOrRef: string, item: Omit<ContractProduct, "contractId">): Promise<ContractProduct | null>;
    updateContract(idOrRef: string, updates: Partial<Pick<Contract, "status" | "contractName" | "agency" | "naics" | "periodOfPerformance" | "contractRef">>): Promise<Contract | null>;
    getContractCatalog(idOrRef: string): Promise<ContractCatalogItem[] | null>;
}
export declare const division2Service: Division2Service;
//# sourceMappingURL=division2.service.d.ts.map