import { Request, Response } from "express";
export declare const division5Controller: {
    listShipments(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getShipment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createShipment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createShipmentFromPO(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateTracking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    markDelivered(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listOverdue(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    fulfillmentSummary(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=division5.controller.d.ts.map