import { Request, Response, NextFunction } from "express";
export declare const currentOperator: {
    id: string;
    name: string;
    division: string;
};
export declare const registry: {
    actions: OperatorAction[];
    relics: any[];
    products: Record<string, any>;
    contracts: Record<string, any>;
    requests: Record<string, any>;
    inventory: Record<string, any>;
    shipments: Record<string, any>;
    compliance: Record<string, any>;
    vendors: Record<string, any>;
    agencies: Record<string, any>;
    quotes: Record<string, any>;
    invoices: Record<string, any>;
    bids: Record<string, any>;
};
export interface OperatorAction {
    division: string;
    actionType: string;
    operatorId: string;
    timestamp: string;
    path: string;
    payloadPreview: string;
}
export declare function operatorWorkflow(division: string, actionType: string): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=engine.d.ts.map