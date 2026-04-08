import { Request, Response } from "express";
export declare const division8Controller: {
    listAgencies(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAgency(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createAgency(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateAgency(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    addContact(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteContact(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    addInteraction(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    agencySummary(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    meta(_req: Request, res: Response): Response<any, Record<string, any>>;
};
//# sourceMappingURL=division8.controller.d.ts.map