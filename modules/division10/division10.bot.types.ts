// modules/division10/division10.bot.types.ts
// Division 10 — Operator Bot Type Definitions (v2)
// Aligned to DIVISION 10 OPERATOR BOT SYSTEM PROMPT (rev 2)

// ── Enumerations ──────────────────────────────────────────────────────────────

export type OpportunityStatus =
  | "DISCOVERY"
  | "CLASSIFIED"
  | "EXTRACTED"
  | "ANALYSIS"
  | "SUPPLIER_MATCHED"
  | "DRAFT_PREP"
  | "READY_FOR_ARCHITECT"
  | "ESCALATED"
  | "HOLD"       // Architect issued Hold — all actions paused
  | "REVISING"   // Architect issued Revise — re-analysis in progress
  | "DECLINED"   // Architect issued Decline — archived, no further action
  | "CLOSED";

// Architect approval commands (spec-defined — no other values accepted)
export type ArchitectCommand = "Proceed" | "Hold" | "Decline" | "Revise" | "More info";

// Uncertainty categories that trigger immediate escalation
export type UncertaintyCategory =
  | "compliance"
  | "supplier-fit"
  | "pricing-variance"
  | "delivery-feasibility"
  | "missing-data"
  | "ambiguous-requirements";

// Spec-aligned relic types
export type BotRelicType =
  | "discovery"
  | "analysis"
  | "match"
  | "prep"
  | "alert"
  | "update"
  | "risk"
  | "recommendation";

// Spec-aligned alert types (kebab-case matching spec)
export type AlertType =
  | "new-opportunity"
  | "deadline-72h"
  | "deadline-48h"
  | "deadline-24h"
  | "amendment"
  | "supplier-issue"
  | "missing-info"
  | "high-variance-price"
  | "compliance-risk"
  | "fit-warning"
  | "escalation"
  | "system";

// Spec severity levels
export type AlertSeverity = "High" | "Medium" | "Low";

// Fit bands per spec (0.80+ strong, 0.50–0.79 moderate, <0.50 weak)
export type FitBand = "strong" | "moderate" | "weak";

// Supplier tier per spec (80+ primary, 60–79 backup, <60 not-recommended)
export type SupplierTier = "primary" | "backup" | "not-recommended";

// ── CLIN ─────────────────────────────────────────────────────────────────────

export interface BotCLIN {
  clin:              string;
  description:       string;
  quantity?:         number;
  unitPrice?:        number;
  deliveryLocation?: string;
  evaluationNote?:   string;
  hasIssue?:         boolean;
}

// ── Supplier matching ─────────────────────────────────────────────────────────

export interface SupplierScoreBreakdown {
  reliability:          number; // 40% weight
  responseTime:         number; // 20% weight
  categoryFit:          number; // 20% weight
  inventoryAvailability:number; // 10% weight
  pastPerformance:      number; // 10% weight
  composite:            number; // 0–100 weighted total
}

export interface SupplierRec {
  vendorId:      string;
  vendorName:    string;
  score:         number;         // 0–100 composite
  tier:          SupplierTier;   // primary / backup / not-recommended
  categories:    string[];
  rationale:     string;
  riskNotes:     string;
  scoreBreakdown:SupplierScoreBreakdown;
}

// ── Draft quote ───────────────────────────────────────────────────────────────

export interface BotQuoteLineItem {
  clin:        string;
  description: string;
  quantity:    number;
  unitPrice:   number;
  extended:    number;
  marginPct:   string;
  priceSource: "catalog" | "estimated" | "contract";
}

export interface BotDraftQuote {
  totalEstimate:     number;
  margin:            number;
  marginBand:        "PREMIUM" | "TARGET" | "LOW" | "BELOW_LOW";
  lineItems:         BotQuoteLineItem[];
  bom:               string[];
  assumptions:       string[];
  pricingAssumptions:string[];
  deliveryNotes:     string;
  riskFlags:         string[];
  requiredDocuments: string[];
  status:            "DRAFT" | "READY_FOR_ARCHITECT_REVIEW";
  preparedAt:        string;
}

// ── Escalation packet (spec-defined format) ───────────────────────────────────

export interface EscalationPacket {
  escalationId:          string;
  oppId:                 string;
  issuedAt:              string;
  subject:               string;           // "[RFQ/Contract/Supplier] — [Action Needed]"
  summary:               string;           // 2–3 sentence overview
  fitScore:              number;           // 0.0–1.0
  fitBand:               FitBand;
  supplierRecommendation:{ name: string; score: number; tier: SupplierTier } | null;
  risks:                 string[];         // bullet list — includes "Risk: Uncertain" if flagged
  uncertaintyFlags:      UncertaintyCategory[];
  deadline:              string;           // ISO timestamp or "No deadline set"
  hoursRemaining:        number | null;
  recommendedAction:     string;           // 1–2 sentences — facts only, no persuasion
  status:                string;           // draft/prepared/awaiting approval
  relicId:               string;           // relic logged with this escalation
  architectAuthority:    string[];         // reminder of what only the Architect can do
  commandsAccepted:      ArchitectCommand[];
  awaitingCommand:       boolean;
}

// ── Architect command log ─────────────────────────────────────────────────────

export interface ArchitectCommandLog {
  commandId:   string;
  oppId:       string;
  command:     ArchitectCommand;
  notes?:      string;
  issuedBy:    string;          // always "Eric Lucero (Architect)"
  issuedAt:    string;
  prevStatus:  OpportunityStatus;
  newStatus:   OpportunityStatus;
  botResponse: string;
  relicId:     string;
}

// ── Architect authority manifest ──────────────────────────────────────────────

export interface ArchitectAuthority {
  architect:          string;
  division:           10;
  exclusiveActions:   string[];
  botCannotDo:        string[];
  commandProtocol:    { command: ArchitectCommand; effect: string; botAction: string }[];
  interactionRules:   string[];
  toneAndConduct:     string[];
  generatedAt:        string;
}

// ── Recommendation engine output ──────────────────────────────────────────────

export interface BotRecommendation {
  pursue:               boolean;
  decision:             "PURSUE" | "EVALUATE" | "DO_NOT_PURSUE";
  rationale:            string;
  recommendedSupplier?: string;
  marginBand:           "PREMIUM" | "TARGET" | "LOW" | "BELOW_LOW";
  requiredDocuments:    string[];
  riskMitigationSteps:  string[];
  deadlineReminder?:    string;
  generatedAt:          string;
}

// ── Core opportunity ──────────────────────────────────────────────────────────

export interface BotOpportunity {
  oppId:                   string;
  solicitationNumber:      string;
  title:                   string;
  agency:                  string;
  naics?:                  string;
  psc?:                    string;
  setAside?:               string;
  deliveryLocation?:       string;
  evaluationCriteria?:     string;
  requiredAttachments?:    string[];
  estimatedValue?:         number;
  deadline?:               string;

  // Fit scoring — 0.0–1.0 per spec
  fitScore?:               number;
  fitBand?:                FitBand;
  fitRationale?:           string[];

  status:                  OpportunityStatus;
  clins:                   BotCLIN[];
  supplierRecommendations: SupplierRec[];
  complianceRisks:         string[];
  riskFlags:               string[];
  draftQuote?:             BotDraftQuote;
  recommendation?:         BotRecommendation;
  notes?:                  string;
  source:                  "SAM.GOV" | "REGISTRY" | "MANUAL" | "DIBBS" | "GSA_EBUY";
  discoveredAt:            string;
  updatedAt:               string;
}

// ── Alert ─────────────────────────────────────────────────────────────────────

export interface BotAlert {
  alertId:        string;
  alertType:      AlertType;
  severity:       AlertSeverity;
  entity:         string;
  message:        string;
  oppId?:         string;
  recommendedAction: string;
  escalatedTo:    string;
  timestamp:      string;
  acknowledged:   boolean;
}

// ── Relic ─────────────────────────────────────────────────────────────────────

export interface BotRelic {
  relicId:   string;
  type:      BotRelicType;
  source:    "bot";
  entity:    string;
  meaning:   string;
  division:  10;
  oppId?:    string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// ── Cycle summaries ───────────────────────────────────────────────────────────

export interface BotCycleSummary {
  cycleId:                  string;
  cycleType:                "hourly" | "6h" | "daily" | "weekly" | "manual";
  ranAt:                    string;
  contractsScanned:         number;
  opportunitiesDiscovered:  number;
  alertsRaised:             number;
  relicsCreated:            number;
  escalations:              string[];
  summary:                  string;
}

// ── Daily intelligence summary ────────────────────────────────────────────────

export interface DailyIntelligenceSummary {
  date:                    string;
  openOpportunities:       number;
  readyForArchitect:       number;
  criticalAlerts:          number;
  upcomingDeadlines:       { solNum: string; deadline: string; hoursRemaining: number }[];
  inventoryVolatilityFlag: boolean;
  agencyTrustNotes:        string[];
  recommendations:         string[];
  generatedAt:             string;
}

// ── Weekly report ─────────────────────────────────────────────────────────────

export interface WeeklyDivision10Report {
  weekEnding:             string;
  totalOpportunities:     number;
  pursuedCount:           number;
  rejectedCount:          number;
  totalRelicsGenerated:   number;
  relicPatterns:          { type: BotRelicType; count: number }[];
  supplierReliability:    { vendorName: string; score: number; trend: "UP" | "DOWN" | "STABLE" }[];
  categoryPerformance:    { category: string; opportunityCount: number; avgFitScore: number }[];
  topAlertTypes:          { alertType: AlertType; count: number }[];
  summary:                string;
  generatedAt:            string;
}

// ── Bot identity & status ─────────────────────────────────────────────────────

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
  loopStep?:                    string;
  lastCycleAt?:                 string;
  lastCycleSummary?:            BotCycleSummary;
  totalRelicsCreated:           number;
  totalAlertsRaised:            number;
  totalOpportunitiesTracked:    number;
  hardRules:                    string[];
  dataCanRead:                  string[];
  dataCanWrite:                 string[];
  alertLogic:                   Record<AlertType, AlertSeverity>;
  generatedAt:                  string;
}

// ── Analysis report ───────────────────────────────────────────────────────────

export interface BotAnalysisReport {
  oppId:               string;
  opportunity:         BotOpportunity;
  fitScore:            number;       // 0.0–1.0
  fitBand:             FitBand;
  fitRationale:        string[];
  complianceRisks:     string[];
  riskFlags:           string[];
  supplierMatch:       SupplierRec[];
  draftQuote?:         BotDraftQuote;
  recommendation:      BotRecommendation;
  nextSteps:           string[];
  escalateToArchitect: boolean;
  loopStep:            string;
  generatedAt:         string;
}
