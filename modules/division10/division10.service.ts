// modules/division10/division10.service.ts
// Division 10 — Intelligence & System View

import { registry, currentOperator } from "../../src/core/engine";
import { SystemSummary, SystemHealth } from "./division10.types";

const startTime = Date.now();

export class Division10Service {
  getSystemSummary(): SystemSummary {
    return {
      products: Object.keys(registry.products).length,
      contracts: Object.keys(registry.contracts).length,
      requests: Object.keys(registry.requests).length,
      inventory: Object.keys(registry.inventory).length,
      shipments: Object.keys(registry.shipments).length,
      compliance: Object.keys(registry.compliance).length,
      vendors: Object.keys(registry.vendors).length,
      agencies: Object.keys(registry.agencies).length,
      quotes: Object.keys(registry.quotes).length,
      invoices: Object.keys(registry.invoices).length,
      totalActions: registry.actions.length,
      generatedAt: new Date().toISOString(),
    };
  }

  getActions(limit?: number): typeof registry.actions {
    const actions = [...registry.actions].reverse();
    return limit ? actions.slice(0, limit) : actions;
  }

  getSystemHealth(): SystemHealth {
    return {
      status: "OK",
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  }

  getOperatorInfo() {
    return currentOperator;
  }
}

export const division10Service = new Division10Service();
