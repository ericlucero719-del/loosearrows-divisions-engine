import { Request, Response } from "express";
export declare const division6Controller: {
    docTypes(_req: Request, res: Response): Response<any, Record<string, any>>;
    listDocs(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getDoc(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createDoc(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateDoc(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteDoc(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    complianceStatus(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    generateCapabilityStatement(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=division6.controller.d.ts.map