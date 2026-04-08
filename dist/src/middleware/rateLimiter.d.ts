import { Request, Response } from "express";
export declare const publicLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const observerLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const operatorLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const architectLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const tierLimiter: (req: Request, res: Response, next: () => void) => void;
//# sourceMappingURL=rateLimiter.d.ts.map