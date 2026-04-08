import { Request, Response } from "express";
export declare const shopifyController: {
    storeInfo(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    syncOrders(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    syncOne(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    webhook(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listOrders(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    summary(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=shopify.controller.d.ts.map