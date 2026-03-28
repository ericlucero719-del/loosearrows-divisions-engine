import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    store?: any;
}
export declare function storeAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=storeAuth.d.ts.map