import { Logger } from "./logger";
export interface ContractData {
    contracts: Record<string, any>;
    naicsCodes: string[];
    clins: string[];
}
export declare function loadContractData({ logger, sourcePath, }: {
    logger: Logger;
    sourcePath: string;
}): Promise<ContractData>;
//# sourceMappingURL=contractDataLoader.d.ts.map