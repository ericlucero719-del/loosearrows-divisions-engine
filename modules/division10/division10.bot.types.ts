// modules/division10/division10.bot.types.ts
// Division 10 — Operator Bot Type Definitions

export type OpportunityStatus =
  | "DISCOVERY"
  | "ANALYSIS"
  | "SUPPLIER_MATCHED"
  | "DRAFT_PREP"
  | "READY_FOR_ARCHITECT"
  | "ESCALATED";

export type BotRelicType = "discovery" | "analysis" | "match" | "prep" | "alert";

export type AlertType =
  | "NEW_RFQ"
  | "DEADLINE_72H"
  | "DEADLINE_48H"
  | "DEADLINE_24H"
  | "AMENDMENT"
  | "SUPPLIER_MISSING"
  | "ESCALATION"
  | "SYSTEM";

export interface BotCLIN {
  clin:              string;
  description:       string;
  quantity?:         number;
  unitPrice?:        number;
  deliveryLocation?: string;
}

export interface SupplierRec {
  vendorId:   string;
  vendorName: string;
  fitScore:   number;
  categories: string[];
  rationale:  string;
}

export interface BotQuoteLineItem {
  clin:        string;
  description: string;
  quantity:    number;
  unitPrice:   number;
  extended:    number;
  marginPct:   string;
}

export interface BotDraftQuote {
  totalEstimate:  number;
  margin:         number;
  marginBand:     "PREMIUM" | "TARGET" | "LOW" | "BELOW_LOW";
  lineItems:      BotQuoteLineItem[];
  assumptions:    string[];
  deliveryNotes:  string;
  riskFlags:      string[];
  status:         "DRAFT" | "READY_FOR_ARCHITECT_REVIEW";
  preparedAt:     string;
}

export interface BotOpportunity {
  oppId:                   string;
  solicitationNumber:      string;
  title:                   string;
  agency:                  string;
  naics?:                  string;
  psc?:                    string;
  setAside?:               string;
  estimatedValue?:         number;
  deadline?:               string;
  fitScore?:               number;
  status:                  OpportunityStatus;
  clins:                   BotCLIN[];
  supplierRecommendations: SupplierRec[];
  complianceRisks:         string[];
  draftQuote?:             BotDraftQuote;
  recommendation?:         string;
  notes?:                  string;
  source:                  "SAM.GOV" | "REGISTRY" | "MANUAL" | "DIBBS" | "GSA_EBUY";
  discoveredAt:            string;
  updatedAt:               string;
}

export interface BotAlert {
  alertId:        string;
  level:          "INFO" | "WARN" | "CRITICAL";
  type:           AlertType;
  message:        string;
  oppId?:         string;
  requiredAction: string;
  escalatedTo:    string;
  createdAt:      string;
  acknowledged:   boolean;
}

export interface BotRelic {
  relicId:   string;
  type:      BotRelicType;
  source:    "bot";
  entity:    string;
  meaning:   string;
  oppId?:    string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface BotCycleSummary {
  cycleId:                  string;
  ranAt:                    string;
  contractsScanned:         number;
  opportunitiesDiscovered:  number;
  alertsRaised:             number;
  relicsCreated:            number;
  escalations:              string[];
  summary:                  string;
}

export interface BotIdentity {
  name:           string;
  division:       10;
  title:          "Operator Bot";
  reportsTo:      string;
  authorityLevel: 1;
}

export interface BotStatus {
  identity:                     BotIdentity;
  mission:                      string;
  status:                       "ACTIVE" | "IDLE" | "SCANNING";
  lastCycleAt?:                 string;
  lastCycleSummary?:            BotCycleSummary;
  totalRelicsCreated:           number;
  totalAlertsRaised:            number;
  totalOpportunitiesTracked:    number;
  hardRules:                    string[];
  dataCanRead:                  string[];
  dataCanWrite:                 string[];
  generatedAt:                  string;
}

export interface BotAnalysisReport {
  oppId:           string;
  opportunity:     BotOpportunity;
  fitScore:        number;
  fitRationale:    string[];
  complianceRisks: string[];
  supplierMatch:   SupplierRec[];
  draftQuote?:     BotDraftQuote;
  recommendation:  string;
  nextSteps:       string[];
  escalateToArchitect: boolean;
  generatedAt:     string;
}
