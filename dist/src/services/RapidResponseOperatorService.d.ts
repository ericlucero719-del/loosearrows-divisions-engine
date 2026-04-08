import { RapidResponseOperator } from "../models/RapidResponseOperator";
export declare class RapidResponseOperatorService {
    private filePath;
    constructor();
    private load;
    private save;
    getAll(): RapidResponseOperator[];
    add(operator: RapidResponseOperator): RapidResponseOperator;
    update(id: string, updates: Partial<RapidResponseOperator>): RapidResponseOperator | null;
}
//# sourceMappingURL=RapidResponseOperatorService.d.ts.map