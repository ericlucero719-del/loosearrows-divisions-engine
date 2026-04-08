import { Request, Response } from "express";
export declare const division9Controller: {
    listInvoices(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getInvoice(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createInvoice(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createInvoiceFromBid(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createInvoiceFromPO(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    recordPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    financialSummary(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=division9.controller.d.ts.map