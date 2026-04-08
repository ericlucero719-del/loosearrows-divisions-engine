import { Request, Response } from "express";
export declare const samController: {
    search(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    matchToAgencies(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    addToWatchlist(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listWatchlist(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    removeFromWatchlist(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    watchlistSummary(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=sam.controller.d.ts.map