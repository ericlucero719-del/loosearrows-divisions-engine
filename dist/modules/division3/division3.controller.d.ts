import { Request, Response } from "express";
export declare const division3Controller: {
    createRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    attachProducts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    linkContract(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listRequests(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getBidPipeline(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createBid(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listBids(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getBid(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    setLineItems(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    generateQuote(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    submitBid(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateBidStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updatePricing(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getSubmissionDoc(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=division3.controller.d.ts.map