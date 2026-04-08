import { registry } from "../../src/core/engine";
import { SystemSummary, SystemHealth, FinancialIntelligence, InventoryIntelligence, OperatorIntelligence, ContractIntelligence, MarginIntelligence, SupplyChainIntelligence, ContractPipelineIntelligence, Relic, AlertIntelligence, ExecutiveAssessment, FullIntelligenceReport } from "./division10.types";
export declare class Division10Service {
    getSystemSummary(): SystemSummary;
    getSystemHealth(): Promise<SystemHealth>;
    getFinancials(): FinancialIntelligence;
    getInventory(): InventoryIntelligence;
    getOperators(): OperatorIntelligence;
    getContracts(): ContractIntelligence;
    getAlerts(): AlertIntelligence;
    getFullReport(): Promise<FullIntelligenceReport>;
    getMargins(): MarginIntelligence;
    getSupply(): SupplyChainIntelligence;
    getPipeline(): ContractPipelineIntelligence;
    getAssessment(): ExecutiveAssessment;
    getActions(limit?: number): typeof registry.actions;
    getOperatorInfo(): {
        id: string;
        name: string;
        division: string;
    };
    getRelics(): Relic[];
    createRelic(data: Partial<Relic> & {
        type: Relic["type"];
        source: string;
        entity: string;
        meaning: string;
    }): Relic;
}
export declare const division10Service: Division10Service;
//# sourceMappingURL=division10.service.d.ts.map