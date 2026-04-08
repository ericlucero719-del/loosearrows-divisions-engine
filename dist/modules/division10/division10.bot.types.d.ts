export type OpportunityStatus = "DISCOVERY" | "CLASSIFIED" | "EXTRACTED" | "ANALYSIS" | "SUPPLIER_MATCHED" | "DRAFT_PREP" | "READY_FOR_ARCHITECT" | "ESCALATED" | "HOLD" | "REVISING" | "DECLINED" | "CLOSED";
export type ArchitectCommand = "Proceed" | "Hold" | "Decline" | "Revise" | "More info";
export type UncertaintyCategory = "compliance" | "supplier-fit" | "pricing-variance" | "delivery-feasibility" | "missing-data" | "ambiguous-requirements";
export type BotRelicType = "discovery" | "analysis" | "match" | "prep" | "alert" | "update" | "risk" | "recommendation";
export type AlertType = "new-opportunity" | "deadline-72h" | "deadline-48h" | "deadline-24h" | "amendment" | "supplier-issue" | "missing-info" | "high-variance-price" | "compliance-risk" | "fit-warning" | "escalation" | "system";
export type AlertSeverity = "High" | "Medium" | "Low";
export type FitBand = "strong" | "moderate" | "weak";
export type SupplierTier = "primary" | "backup" | "not-recommended";
export interface BotCLIN {
    clin: string;
    description: string;
    quantity?: number;
    unitPrice?: number;
    deliveryLocation?: string;
    evaluationNote?: string;
    hasIssue?: boolean;
}
export interface SupplierScoreBreakdown {
    reliability: number;
    responseTime: number;
    categoryFit: number;
    inventoryAvailability: number;
    pastPerformance: number;
    composite: number;
}
export interface SupplierRec {
    vendorId: string;
    vendorName: string;
    score: number;
    tier: SupplierTier;
    categories: string[];
    rationale: string;
    riskNotes: string;
    scoreBreakdown: SupplierScoreBreakdown;
}
export interface BotQuoteLineItem {
    clin: string;
    description: string;
    quantity: number;
    unitPrice: number;
    extended: number;
    marginPct: string;
    priceSource: "catalog" | "estimated" | "contract";
}
export interface BotDraftQuote {
    totalEstimate: number;
    margin: number;
    marginBand: "PREMIUM" | "TARGET" | "LOW" | "BELOW_LOW";
    lineItems: BotQuoteLineItem[];
    bom: string[];
    assumptions: string[];
    pricingAssumptions: string[];
    deliveryNotes: string;
    riskFlags: string[];
    requiredDocuments: string[];
    status: "DRAFT" | "READY_FOR_ARCHITECT_REVIEW";
    preparedAt: string;
}
export interface EscalationPacket {
    escalationId: string;
    oppId: string;
    issuedAt: string;
    subject: string;
    summary: string;
    fitScore: number;
    fitBand: FitBand;
    supplierRecommendation: {
        name: string;
        score: number;
        tier: SupplierTier;
    } | null;
    risks: string[];
    uncertaintyFlags: UncertaintyCategory[];
    deadline: string;
    hoursRemaining: number | null;
    recommendedAction: string;
    status: string;
    relicId: string;
    architectAuthority: string[];
    commandsAccepted: ArchitectCommand[];
    awaitingCommand: boolean;
}
export interface ArchitectCommandLog {
    commandId: string;
    oppId: string;
    command: ArchitectCommand;
    notes?: string;
    issuedBy: string;
    issuedAt: string;
    prevStatus: OpportunityStatus;
    newStatus: OpportunityStatus;
    botResponse: string;
    relicId: string;
}
export interface ArchitectAuthority {
    architect: string;
    division: 10;
    exclusiveActions: string[];
    botCannotDo: string[];
    commandProtocol: {
        command: ArchitectCommand;
        effect: string;
        botAction: string;
    }[];
    interactionRules: string[];
    toneAndConduct: string[];
    generatedAt: string;
}
export interface BotRecommendation {
    pursue: boolean;
    decision: "PURSUE" | "EVALUATE" | "DO_NOT_PURSUE";
    rationale: string;
    recommendedSupplier?: string;
    marginBand: "PREMIUM" | "TARGET" | "LOW" | "BELOW_LOW";
    requiredDocuments: string[];
    riskMitigationSteps: string[];
    deadlineReminder?: string;
    generatedAt: string;
}
export interface BotOpportunity {
    oppId: string;
    solicitationNumber: string;
    title: string;
    agency: string;
    naics?: string;
    psc?: string;
    setAside?: string;
    deliveryLocation?: string;
    evaluationCriteria?: string;
    requiredAttachments?: string[];
    estimatedValue?: number;
    deadline?: string;
    fitScore?: number;
    fitBand?: FitBand;
    fitRationale?: string[];
    status: OpportunityStatus;
    clins: BotCLIN[];
    supplierRecommendations: SupplierRec[];
    complianceRisks: string[];
    riskFlags: string[];
    draftQuote?: BotDraftQuote;
    recommendation?: BotRecommendation;
    notes?: string;
    source: "SAM.GOV" | "REGISTRY" | "MANUAL" | "DIBBS" | "GSA_EBUY";
    discoveredAt: string;
    updatedAt: string;
    pipelineRef?: {
        contractId: string;
        bidId: string;
        bidRef: string;
        createdAt: string;
    };
}
export interface BotAlert {
    alertId: string;
    alertType: AlertType;
    severity: AlertSeverity;
    entity: string;
    message: string;
    oppId?: string;
    recommendedAction: string;
    escalatedTo: string;
    timestamp: string;
    acknowledged: boolean;
}
export interface BotRelic {
    relicId: string;
    type: BotRelicType;
    source: "bot";
    entity: string;
    meaning: string;
    division: 10;
    oppId?: string;
    metadata?: Record<string, any>;
    timestamp: string;
}
export interface BotCycleSummary {
    cycleId: string;
    cycleType: "hourly" | "6h" | "daily" | "weekly" | "manual";
    ranAt: string;
    contractsScanned: number;
    opportunitiesDiscovered: number;
    alertsRaised: number;
    relicsCreated: number;
    escalations: string[];
    summary: string;
}
export interface DailyIntelligenceSummary {
    date: string;
    openOpportunities: number;
    readyForArchitect: number;
    criticalAlerts: number;
    upcomingDeadlines: {
        solNum: string;
        deadline: string;
        hoursRemaining: number;
    }[];
    inventoryVolatilityFlag: boolean;
    agencyTrustNotes: string[];
    recommendations: string[];
    generatedAt: string;
}
export interface WeeklyDivision10Report {
    weekEnding: string;
    totalOpportunities: number;
    pursuedCount: number;
    rejectedCount: number;
    totalRelicsGenerated: number;
    relicPatterns: {
        type: BotRelicType;
        count: number;
    }[];
    supplierReliability: {
        vendorName: string;
        score: number;
        trend: "UP" | "DOWN" | "STABLE";
    }[];
    categoryPerformance: {
        category: string;
        opportunityCount: number;
        avgFitScore: number;
    }[];
    topAlertTypes: {
        alertType: AlertType;
        count: number;
    }[];
    summary: string;
    generatedAt: string;
}
export interface BotIdentity {
    name: string;
    division: 10;
    title: "Operator Bot";
    reportsTo: string;
    authorityLevel: 1;
}
export interface BotStatus {
    identity: BotIdentity;
    mission: string;
    status: "ACTIVE" | "IDLE" | "SCANNING";
    loopStep?: string;
    lastCycleAt?: string;
    lastCycleSummary?: BotCycleSummary;
    totalRelicsCreated: number;
    totalAlertsRaised: number;
    totalOpportunitiesTracked: number;
    hardRules: string[];
    dataCanRead: string[];
    dataCanWrite: string[];
    alertLogic: Record<AlertType, AlertSeverity>;
    generatedAt: string;
}
export interface BotAnalysisReport {
    oppId: string;
    opportunity: BotOpportunity;
    fitScore: number;
    fitBand: FitBand;
    fitRationale: string[];
    complianceRisks: string[];
    riskFlags: string[];
    supplierMatch: SupplierRec[];
    draftQuote?: BotDraftQuote;
    recommendation: BotRecommendation;
    nextSteps: string[];
    escalateToArchitect: boolean;
    loopStep: string;
    generatedAt: string;
}
//# sourceMappingURL=division10.bot.types.d.ts.map