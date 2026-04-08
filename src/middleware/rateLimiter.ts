// src/middleware/rateLimiter.ts
// Tier-aware rate limiting. Public routes get the strictest cap.
// API-key routes escalate limits based on key tier embedded by apiKey middleware.

import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { Request, Response } from "express";

function makeLimit(max: number, windowMin: number, label: string) {
  return rateLimit({
    windowMs:          windowMin * 60 * 1000,
    max,
    standardHeaders:   true,
    legacyHeaders:     false,
    // Use the API key id when present, fall back to IPv6-safe IP key generator
    keyGenerator:      (req) => {
      const keyId = (req as any).apiKeyId as string | undefined;
      return keyId ?? ipKeyGenerator(req.ip ?? "anon");
    },
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        error:    "Rate limit exceeded.",
        tier:     label,
        limit:    max,
        window:   `${windowMin} minutes`,
        hint:     "Upgrade your API key tier for higher limits, or wait for the window to reset.",
      });
    },
  });
}

// Per-tier limiters (applied after apiKey middleware sets req.apiKeyTier)
export const publicLimiter    = makeLimit(60,   15, "PUBLIC");     // 60 req / 15 min
export const observerLimiter  = makeLimit(200,  15, "OBSERVER");   // 200 req / 15 min
export const operatorLimiter  = makeLimit(1000, 15, "OPERATOR");   // 1 000 req / 15 min
export const architectLimiter = makeLimit(5000, 15, "ARCHITECT");  // 5 000 req / 15 min

// Dynamic dispatcher — selects the right limiter based on key tier
export const tierLimiter = (req: Request, res: Response, next: () => void) => {
  const tier = (req as any).apiKeyTier as string | undefined;
  if (tier === "ARCHITECT") return architectLimiter(req, res, next);
  if (tier === "OPERATOR")  return operatorLimiter(req, res, next);
  if (tier === "OBSERVER")  return observerLimiter(req, res, next);
  return publicLimiter(req, res, next);
};
