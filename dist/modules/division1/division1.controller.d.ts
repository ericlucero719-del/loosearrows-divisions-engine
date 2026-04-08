import { Request, Response } from "express";
export declare const division1Controller: {
    listProducts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    priceCalc(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    bulkImport(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    catalogSummary(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=division1.controller.d.ts.map