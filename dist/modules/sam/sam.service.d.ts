export declare const samService: {
    search(opts: {
        keyword?: string;
        naics?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        total: any;
        returned: any;
        opportunities: any;
    }>;
    matchToAgencies(): Promise<{
        agency: string;
        naics: string;
        matches: any[];
    }[]>;
    addToWatchlist(noticeId: string, status?: string, notes?: string, manual?: Record<string, any>): Promise<any>;
    listWatchlist(status?: string): Promise<any>;
    updateStatus(noticeId: string, status: string, notes?: string): Promise<any>;
    removeFromWatchlist(noticeId: string): Promise<any>;
    watchlistSummary(): Promise<{
        total: any;
        totalAwardValue: number;
        byStatus: Record<string, number>;
    }>;
};
//# sourceMappingURL=sam.service.d.ts.map