import { Request, Response } from "express";
import { CommerceService } from "./commerce.service";
export declare function makeCommerceController(svc: CommerceService): {
    captureOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    fulfill(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    invoice(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    payment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    notify(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listOrders(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    summary(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=commerce.controller.d.ts.map