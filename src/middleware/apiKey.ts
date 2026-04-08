// src/middleware/apiKey.ts
// API Key Authentication Middleware
// ─────────────────────────────────────────────────────────────────────────────
// Tiers:
//   OBSERVER  — GET requests only (read-only dashboards, bid pipeline view)
//   OPERATOR  — Full Division 1-9 access (create bids, manage vendors, etc.)
//   ARCHITECT — Full access including Division 10 bot commands
//
// Public paths (no key required):
//   GET /          — homepage / upload UI
//   GET /demo      — marketing demo page
//   GET /api       — API docs
//   GET /vendor-cockpit, /operator-control-room, /division10-cockpit — dashboards (HTML only)
//   GET /division/10/system/health — health check
//   Static assets (*.js, *.css, *.png, etc.)

import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// These URL patterns never need a key
const PUBLIC_EXACT: Set<string> = new Set([
  "/",
  "/demo",
  "/guide",
  "/legal",
  "/pricing",
  "/onboarding",
  "/client-guide",
  // API docs — both old and new canonical path
  "/api",
  "/api/",
  // Health check — both paths
  "/division/10/system/health",
  "/api/health",
  // Dashboards
  "/vendor-cockpit",
  "/operator-control-room",
  "/division10-cockpit",
  // Legacy public aliases
  "/vendor/dashboard",
  "/operator/dashboard",
  "/vendor-portal",
]);

const PUBLIC_PREFIX: string[] = [
  "/public/",
];

const STATIC_EXT = /\.(html|css|js|map|png|jpg|jpeg|ico|svg|woff|woff2|ttf|eot)(\?.*)?$/i;

// Only Architect keys can touch Division 10 bot commands
const ARCHITECT_ONLY: RegExp[] = [
  /^\/division\/10\/bot/,
  /^\/division\/10\/system\/architect/,
];

export async function requireApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Use originalUrl so path matching works regardless of where the middleware is mounted.
  // Strip query string for clean matching.
  const p = req.originalUrl.split("?")[0];

  // ── Let public paths through ─────────────────────────────────────────────
  if (PUBLIC_EXACT.has(p)) return next();
  if (PUBLIC_PREFIX.some(prefix => p.startsWith(prefix))) return next();
  if (STATIC_EXT.test(p)) return next();

  // ── Require key ──────────────────────────────────────────────────────────
  const rawKey = (req.headers["x-api-key"] as string) ?? "";
  if (!rawKey) {
    res.status(401).json({
      error: "API key required.",
      hint: "Include your key as the X-API-Key request header.",
      tiers: "OBSERVER (read-only) | OPERATOR (full pipeline) | ARCHITECT (full + bot)",
    });
    return;
  }

  let record: { id: string; tier: string; ownerName: string; active: boolean } | null = null;
  try {
    record = await prisma.apiKey.findUnique({ where: { key: rawKey } });
  } catch {
    res.status(500).json({ error: "Authentication service unavailable. Try again shortly." });
    return;
  }

  if (!record || !record.active) {
    res.status(401).json({ error: "Invalid or inactive API key." });
    return;
  }

  const tier    = record.tier;
  const method  = req.method.toUpperCase();
  const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  // ARCHITECT-only paths (use full original URL for matching)
  if (ARCHITECT_ONLY.some(pat => pat.test(p)) && tier !== "ARCHITECT") {
    res.status(403).json({
      error: "Architect tier required for this endpoint.",
      yourTier: tier,
    });
    return;
  }

  // OBSERVER = read-only
  if (tier === "OBSERVER" && isWrite) {
    res.status(403).json({
      error: "Observer tier is read-only. Upgrade to Operator or Architect to write data.",
      yourTier: tier,
    });
    return;
  }

  // Update last-used timestamp in background (non-blocking)
  prisma.apiKey.update({
    where: { id: record.id },
    data:  { lastUsedAt: new Date() },
  }).catch(() => {});

  // Attach tier info to request for downstream use
  (req as any).apiTier      = tier;
  (req as any).apiKeyTier   = tier;          // alias used by rate limiter
  (req as any).apiKeyId     = record.id;     // used as rate-limit bucket key
  (req as any).apiKeyOwner  = record.ownerName;

  next();
}
