"use strict";
// src/core/engine.ts
// Shared operator identity, registry, and operatorWorkflow middleware
Object.defineProperty(exports, "__esModule", { value: true });
exports.registry = exports.currentOperator = void 0;
exports.operatorWorkflow = operatorWorkflow;
// ---------------------------------------------------------------------------
// Operator Identity
// ---------------------------------------------------------------------------
exports.currentOperator = {
    id: "OPERATOR-LA-001",
    name: "Loose Arrows Primary Operator",
    division: "SYSTEM",
};
// ---------------------------------------------------------------------------
// Shared In-Memory Registry
// ---------------------------------------------------------------------------
exports.registry = {
    actions: [],
    relics: [],
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
    bids: {},
};
// ---------------------------------------------------------------------------
// operatorWorkflow middleware
// ---------------------------------------------------------------------------
function operatorWorkflow(division, actionType) {
    return (req, _res, next) => {
        const action = {
            division,
            actionType,
            operatorId: exports.currentOperator.id,
            timestamp: new Date().toISOString(),
            path: req.path,
            payloadPreview: JSON.stringify(req.body ?? {}).slice(0, 200),
        };
        console.log(`[${division}] ${actionType} | op=${exports.currentOperator.id} | ${req.method} ${req.path}`);
        exports.registry.actions.push(action);
        req.operatorAction = action;
        next();
    };
}
//# sourceMappingURL=engine.js.map