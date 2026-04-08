"use strict";
// src/middleware/rateLimiter.ts
// Tier-aware rate limiting. Public routes get the strictest cap.
// API-key routes escalate limits based on key tier embedded by apiKey middleware.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.tierLimiter = exports.architectLimiter = exports.operatorLimiter = exports.observerLimiter = exports.publicLimiter = void 0;
const express_rate_limit_1 = __importStar(require("express-rate-limit"));
function makeLimit(max, windowMin, label) {
    return (0, express_rate_limit_1.default)({
        windowMs: windowMin * 60 * 1000,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        // Use the API key id when present, fall back to IPv6-safe IP key generator
        keyGenerator: (req) => {
            const keyId = req.apiKeyId;
            return keyId ?? (0, express_rate_limit_1.ipKeyGenerator)(req.ip ?? "anon");
        },
        handler: (_req, res) => {
            res.status(429).json({
                error: "Rate limit exceeded.",
                tier: label,
                limit: max,
                window: `${windowMin} minutes`,
                hint: "Upgrade your API key tier for higher limits, or wait for the window to reset.",
            });
        },
    });
}
// Per-tier limiters (applied after apiKey middleware sets req.apiKeyTier)
exports.publicLimiter = makeLimit(60, 15, "PUBLIC"); // 60 req / 15 min
exports.observerLimiter = makeLimit(200, 15, "OBSERVER"); // 200 req / 15 min
exports.operatorLimiter = makeLimit(1000, 15, "OPERATOR"); // 1 000 req / 15 min
exports.architectLimiter = makeLimit(5000, 15, "ARCHITECT"); // 5 000 req / 15 min
// Dynamic dispatcher — selects the right limiter based on key tier
const tierLimiter = (req, res, next) => {
    const tier = req.apiKeyTier;
    if (tier === "ARCHITECT")
        return (0, exports.architectLimiter)(req, res, next);
    if (tier === "OPERATOR")
        return (0, exports.operatorLimiter)(req, res, next);
    if (tier === "OBSERVER")
        return (0, exports.observerLimiter)(req, res, next);
    return (0, exports.publicLimiter)(req, res, next);
};
exports.tierLimiter = tierLimiter;
//# sourceMappingURL=rateLimiter.js.map