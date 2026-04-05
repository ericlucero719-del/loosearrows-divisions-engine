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
  divisions: DivisionStatus[];
}

export interface DivisionStatus {
  id: number;
  name: string;
  recordCount: number;
  lastAction?: string;
  status: "ACTIVE" | "EMPTY" | "ALERT";
}

export interface FinancialIntelligence {
  totalQuoted: number;
  totalInvoiced: number;
  conversionRate: string;
  openQuotes: number;
  paidInvoices: number;
  pendingInvoices: number;
  topQuotedProducts: { sku: string; count: number }[];
}

export interface InventoryIntelligence {
  totalSKUs: number;
  totalUnits: number;
  lowStockAlerts: { sku: string; qty: number }[];
  topStockedSKUs: { sku: string; qty: number }[];
}

export interface OperatorIntelligence {
  totalOperators: number;
  eliteCount: number;
  seniorCount: number;
  standardCount: number;
  topOperator?: { id: string; name: string; score: number; tier: string };
  averageScore: number;
}

export interface ContractIntelligence {
  totalContracts: number;
  totalCLINs: number;
  contractsWithProducts: number;
  topContracts: { contractRef: string; productCount: number }[];
}

export interface SystemAlert {
  level: "INFO" | "WARN" | "CRITICAL";
  division: number;
  message: string;
  detectedAt: string;
}

export interface FullIntelligenceReport {
  summary: SystemSummary;
  health: SystemHealth;
  financials: FinancialIntelligence;
  inventory: InventoryIntelligence;
  operators: OperatorIntelligence;
  contracts: ContractIntelligence;
  alerts: SystemAlert[];
  generatedAt: string;
}
