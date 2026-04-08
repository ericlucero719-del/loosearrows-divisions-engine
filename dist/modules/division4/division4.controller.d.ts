import { Request, Response } from "express";
export declare const division4Controller: {
    listPOs(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getPO(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createPO(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createPOFromBid(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    inventorySummary(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=division4.controller.d.ts.map