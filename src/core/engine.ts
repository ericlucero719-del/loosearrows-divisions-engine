// src/core/engine.ts
// Shared operator identity, registry, and operatorWorkflow middleware

import { Request, Response, NextFunction } from "express";

// ---------------------------------------------------------------------------
// Operator Identity
// ---------------------------------------------------------------------------
export const currentOperator = {
  id: "OPERATOR-LA-001",
  name: "Loose Arrows Primary Operator",
  division: "SYSTEM",
};

// ---------------------------------------------------------------------------
// Shared In-Memory Registry
// ---------------------------------------------------------------------------
export const registry: {
  actions: OperatorAction[];
  relics:  any[];
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
} = {
  actions: [],
  relics:  [],
  products: {},
  contracts: {},
  requests: {},
  inventory: {},
  shipments: {},
  compliance: {},
  vendors: {},
  agencies: {},
  quotes: {},
  invoices: {},
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface OperatorAction {
  division: string;
  actionType: string;
  operatorId: string;
  timestamp: string;
  path: string;
  payloadPreview: string;
}

// ---------------------------------------------------------------------------
// operatorWorkflow middleware
// ---------------------------------------------------------------------------
export function operatorWorkflow(division: string, actionType: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const action: OperatorAction = {
      division,
      actionType,
      operatorId: currentOperator.id,
      timestamp: new Date().toISOString(),
      path: req.path,
      payloadPreview: JSON.stringify(req.body ?? {}).slice(0, 200),
    };

    console.log(
      `[${division}] ${actionType} | op=${currentOperator.id} | ${req.method} ${req.path}`
    );

    registry.actions.push(action);
    (req as any).operatorAction = action;
    next();
  };
}
