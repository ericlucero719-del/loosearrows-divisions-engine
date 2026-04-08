import { BotOpportunity, BotRelic, BotAlert, BotCycleSummary, BotStatus, BotAnalysisReport, BotDraftQuote, SupplierRec, BotCLIN, OpportunityStatus, BotRelicType, AlertSeverity, ArchitectCommand, ArchitectCommandLog, ArchitectAuthority, EscalationPacket, DailyIntelligenceSummary, WeeklyDivision10Report } from "./division10.bot.types";
declare function runCycle(cycleType?: BotCycleSummary["cycleType"]): BotCycleSummary;
declare function buildDailySummary(): DailyIntelligenceSummary;
declare function buildWeeklyReport(): WeeklyDivision10Report;
declare function buildEscalationPacket(oppId: string): EscalationPacket | {
    error: string;
};
declare function issueArchitectCommand(oppId: string, command: ArchitectCommand, notes?: string): Promise<ArchitectCommandLog | {
    error: string;
}>;
declare function analyzeOpportunity(oppId: string): BotAnalysisReport | {
    error: string;
};
declare function matchSuppliers(oppId: string): SupplierRec[] | {
    error: string;
};
declare function prepDraft(oppId: string): BotDraftQuote | {
    error: string;
};
export declare const botService: {
    getStatus(): BotStatus;
    runCycle: typeof runCycle;
    analyzeOpportunity: typeof analyzeOpportunity;
    matchSuppliers: typeof matchSuppliers;
    prepDraft: typeof prepDraft;
    listOpportunities(status?: OpportunityStatus): BotOpportunity[];
    getOpportunity(oppId: string): BotOpportunity | null;
    ingestOpportunity(data: {
        solicitationNumber: string;
        title: string;
        agency: string;
        naics?: string;
        psc?: string;
        setAside?: string;
        deliveryLocation?: string;
        estimatedValue?: number;
        deadline?: string;
        notes?: string;
        clins?: BotCLIN[];
        source?: BotOpportunity["source"];
    }): BotOpportunity;
    getRelics(type?: BotRelicType, oppId?: string, limit?: number): BotRelic[];
    getAlerts(level?: AlertSeverity, acknowledged?: boolean): BotAlert[];
    acknowledgeAlert(alertId: string): BotAlert | {
        error: string;
    };
    getCycles(limit?: number): BotCycleSummary[];
    getDailySummary: typeof buildDailySummary;
    getWeeklyReport: typeof buildWeeklyReport;
    buildEscalationPacket: typeof buildEscalationPacket;
    issueArchitectCommand: typeof issueArchitectCommand;
    getCommandLog(oppId?: string): ArchitectCommandLog[];
    getArchitectAuthority(): ArchitectAuthority;
};
export {};
//# sourceMappingURL=division10.bot.service.d.ts.map