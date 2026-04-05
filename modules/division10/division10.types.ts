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

export interface OperatorRecord {
  name:           string;
  role:           string;
  status:         "active" | "inactive" | "busy";
  relicsCreated:  number;
  authorityLevel: number;
  tier?:          string;
  performanceScore?: number;
}

export interface OperatorIntelligence {
  totalOperators: number;
  eliteCount:     number;
  seniorCount:    number;
  standardCount:  number;
  topOperator?:   { id: string; name: string; score: number; tier: string };
  averageScore:   number;
  operators:      OperatorRecord[];
}

export interface ContractIntelligence {
  totalContracts: number;
  totalCLINs: number;
  contractsWithProducts: number;
  topContracts: { contractRef: string; productCount: number }[];
}

export interface ActiveContract {
  contractRef:   string;
  agency:        string;
  value:         number;
  status:        "ACTIVE" | "PENDING" | "EXPIRING" | "CLOSED";
  clinCount:     number;
  expiresAt?:    string;
}

export interface PipelineRFQ {
  rfqId:          string;
  agency:         string;
  description:    string;
  estimatedValue: number;
  status:         "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "AWARDED" | "LOST";
  submittedAt?:   string;
  dueDate?:       string;
}

export interface AgencyRelationship {
  agencyId:     string;
  agencyName:   string;
  tier:         "PREFERRED" | "ACTIVE" | "PROSPECT" | "DORMANT";
  contracts:    number;
  totalValue:   number;
  lastContact?: string;
}

export interface ContractPipelineIntelligence {
  divisionId:          number;
  activeContracts:     ActiveContract[];
  pipelineRFQs:        PipelineRFQ[];
  winRate:             number;
  agencyRelationships: AgencyRelationship[];
  totalPipelineValue:  number;
  totalContractValue:  number;
  generatedAt:         string;
}

export interface SystemAlert {
  level:     "INFO" | "WARN" | "CRITICAL";
  severity:  "low" | "medium" | "high";
  division:  number;
  message:   string;
  detectedAt: string;
}

export interface AlertIntelligence {
  divisionId:     number;
  alerts:         SystemAlert[];
  severityLevels: {
    low:    SystemAlert[];
    medium: SystemAlert[];
    high:   SystemAlert[];
  };
  generatedAt: string;
}

export interface MarginBands {
  low:     number;
  target:  number;
  premium: number;
}

export interface CategoryMargin {
  category:    string;
  revenue:     number;
  cost:        number;
  margin:      number;
  marginPct:   string;
  band:        "PREMIUM" | "TARGET" | "LOW" | "BELOW_LOW";
  skuCount:    number;
}

export interface RiskFlag {
  sku:      string;
  reason:   string;
  margin:   number;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export interface MarginIntelligence {
  divisionId:              number;
  marginBands:             MarginBands;
  monthlyRevenue:          number;
  monthlyCost:             number;
  blendedMargin:           number;
  blendedMarginPct:        string;
  capitalEfficiencyScore:  number;
  topCategories:           CategoryMargin[];
  riskFlags:               RiskFlag[];
  generatedAt:             string;
}

export interface SupplyItem {
  sku:          string;
  productName:  string;
  qty:          number;
  reorderPoint: number;
  status:       "OK" | "LOW" | "CRITICAL" | "OUT";
  vendor?:      string;
  lastRestocked?: string;
}

export interface SupplierAvailability {
  vendorId:   string;
  vendorName: string;
  skus:       string[];
  skuCount:   number;
  status:     "ACTIVE" | "INACTIVE" | "UNKNOWN";
}

export interface RestockAlert {
  sku:          string;
  productName:  string;
  currentQty:   number;
  reorderPoint: number;
  suggestedQty: number;
  vendor?:      string;
  urgency:      "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface SupplyChainIntelligence {
  divisionId:           number;
  items:                SupplyItem[];
  supplierAvailability: SupplierAvailability[];
  restockAlerts:        RestockAlert[];
  volatilityIndex:      number;
  generatedAt:          string;
}

export type HealthStatus = "unknown" | "initializing" | "healthy" | "degraded" | "critical";

export interface AssessmentSummary {
  financialHealth:   HealthStatus;
  operationalStatus: HealthStatus;
  supplierStrength:  HealthStatus;
  agencyTrust:       HealthStatus;
}

export interface ExecutiveAssessment {
  divisionId:      number;
  summary:         AssessmentSummary;
  recommendations: string[];
  overallStatus:   HealthStatus;
  scoreBreakdown: {
    financial:   number;
    operational: number;
    supply:      number;
    agency:      number;
    composite:   number;
  };
  generatedAt: string;
}

export interface FullIntelligenceReport {
  summary: SystemSummary;
  health: SystemHealth;
  financials: FinancialIntelligence;
  inventory: InventoryIntelligence;
  operators: OperatorIntelligence;
  contracts: ContractIntelligence;
  margins: MarginIntelligence;
  supply:    SupplyChainIntelligence;
  pipeline:  ContractPipelineIntelligence;
  alerts:     AlertIntelligence;
  assessment: ExecutiveAssessment;
  generatedAt: string;
}
