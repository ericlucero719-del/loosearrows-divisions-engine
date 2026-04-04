// modules/division10/division10.types.ts
// Division 10 — Intelligence & System View

export interface SystemSummary {
  products: number;
  contracts: number;
  requests: number;
  inventory: number;
  shipments: number;
  compliance: number;
  vendors: number;
  agencies: number;
  quotes: number;
  invoices: number;
  totalActions: number;
  generatedAt: string;
}

export interface SystemHealth {
  status: "OK" | "DEGRADED";
  uptime: number;
  timestamp: string;
}
