// src/api/index.ts
// LooseArrows Supply & Logistics™
// Master API Router — single entry point for all programmatic access
//
// Mount point: app.use("/api", apiRouter)  (see src/server.ts)
//
// ── Public (no key required) ──────────────────────────────────────────────────
// GET  /api                     → comprehensive API docs
// GET  /api/health              → system health (alias for /division/10/system/health)
//
// ── Admin (X-Admin-Secret, no API key) ───────────────────────────────────────
// *    /api/admin/*             → Division 0 System Command Center
//
// ── Operator / Architect  (X-API-Key required for everything below) ───────────
// *    /api/division/1          → Product Intake & Pricing
// *    /api/division/2          → Contract Alignment
// *    /api/division/3          → Requests & Work Orders
// *    /api/division/4          → Inventory & Assets
// *    /api/division/5          → Logistics & Fulfillment
// *    /api/division/6          → Compliance & Documentation
// *    /api/division/7          → Vendor & Partner Management
// *    /api/division/8          → Agency / Customer Management
// *    /api/division/9          → Financials
// *    /api/division/10         → Intelligence & System View
// *    /api/tiktok              → TikTok Sales Automation Layer
// *    /api/field               → Rapid Response Field Operations

import { Router, Request, Response, json as expressJson } from "express";
import { requireApiKey }  from "../middleware/apiKey";
import { tierLimiter }    from "../middleware/rateLimiter";
import pdfRouter          from "../../modules/pdf/pdf.routes";
import agentRouter        from "./agent/agent.routes";

// ── Division Engine routers ───────────────────────────────────────────────────
import div0Router  from "../../modules/division0/division0.routes";
import div1Router  from "../../modules/division1/division1.routes";
import div2Router  from "../../modules/division2/division2.routes";
import div3Router  from "../../modules/division3/division3.routes";
import div4Router  from "../../modules/division4/division4.routes";
import div5Router  from "../../modules/division5/division5.routes";
import div6Router  from "../../modules/division6/division6.routes";
import div7Router  from "../../modules/division7/division7.routes";
import div8Router  from "../../modules/division8/division8.routes";
import div9Router  from "../../modules/division9/division9.routes";
import div10Router from "../../modules/division10/division10.routes";
import tikTokRouter     from "../../modules/tiktok/tiktok.routes";
import instagramRouter  from "../../modules/instagram/instagram.routes";
import youtubeRouter    from "../../modules/youtube/youtube.routes";
import amazonRouter     from "../../modules/amazon/amazon.routes";
import { CommerceService }  from "../../modules/commerce/commerce.service";
import shopifyRouter        from "../../modules/shopify/shopify.routes";
import { shopifyController } from "../../modules/shopify/shopify.controller";
import samRouter            from "../../modules/sam/sam.routes";
import billingRouter        from "../../modules/billing/billing.routes";
import cryptoRouter         from "../../modules/crypto/crypto.routes";
import resellerRouter       from "../../modules/reseller/reseller.routes";
import stripeRouter         from "../stripe/routes";
import { registerReseller } from "../../modules/reseller/reseller.service";

// ── Rapid Response (legacy CommonJS) ─────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rrDispatch  = require("../routes/rapidResponseDispatchRoute");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rrTask      = require("../routes/rapidResponseTaskRoute");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rrEvent     = require("../routes/rapidResponseEventRoute");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rrOperator  = require("../routes/rapidResponseOperatorRoute");

const apiRouter = Router();

// ── 1. Public endpoints — must come BEFORE the key gate ──────────────────────

apiRouter.get("/", (_req: Request, res: Response) => {
  res.json({
    engine:   "Loose Arrows Divisions Engine v2.0",
    company:  "Loose Arrows Supply & Logistics™",
    auth: {
      header:    "X-API-Key",
      tiers:     { OBSERVER: "read-only GET", OPERATOR: "full pipeline", ARCHITECT: "full + bot commands" },
      adminOnly: "X-Admin-Secret header required for /api/admin/*",
    },
    public: [
      "GET  /api              — this document",
      "GET  /api/health       — system health (all 11 divisions)",
      "POST /api/agent/chat   — agent chat (body: { message: string })",
    ],
    admin: [
      "GET  /api/admin/status     — all division counts + operational score",
      "GET  /api/admin/pipeline   — contract → bid → PO → shipment → invoice",
      "GET  /api/admin/financials — PO value, invoiced, paid, outstanding",
      "GET  /api/admin/vendors    — full vendor roster",
      "GET  /api/admin/contracts  — full contract roster",
      "GET  /api/admin/activity   — recent event feed",
    ],
    divisions: {
      1:  "GET|POST  /api/division/1   — Product Intake & Pricing",
      2:  "GET|POST  /api/division/2   — Contract Alignment",
      3:  "GET|POST  /api/division/3   — Requests & Work Orders",
      4:  "GET|POST  /api/division/4   — Inventory & Assets",
      5:  "GET|POST  /api/division/5   — Logistics & Fulfillment",
      6:  "GET|POST  /api/division/6   — Compliance & Documentation",
      7:  "GET|POST  /api/division/7   — Vendor & Partner Management",
      8:  "GET|POST  /api/division/8   — Agency / Customer Management",
      9:  "GET|POST  /api/division/9   — Financials",
      10: "GET|POST  /api/division/10  — Intelligence & System View (bot: ARCHITECT only)",
    },
    commerce: {
      note:         "All 4 platforms share the same 5-step pipeline — only the URL prefix differs",
      allSummary:   "GET  /api/commerce/summary         — cross-platform aggregate (revenue/profit/orders by platform)",
      platforms:    ["tiktok", "instagram", "youtube", "amazon"],
      endpoints: {
        capture:  "POST /api/<platform>/order              — ingest order → SKU match → profit → auto PO",
        fulfill:  "POST /api/<platform>/fulfill             — home (label+tracking) | supplier push",
        invoice:  "POST /api/<platform>/invoice             — generate Division 9 invoice",
        payment:  "POST /api/<platform>/payment             — record payment, mark invoice PAID",
        notify:   "POST /api/<platform>/notify              — log event + sync Division 1 inventory",
        orders:   "GET  /api/<platform>/orders              — list orders (?status= filter)",
        order:    "GET  /api/<platform>/orders/:id          — full order detail",
        summary:  "GET  /api/<platform>/summary             — per-platform revenue / profit / breakdown",
      },
    },
    field: {
      dispatch: "POST /api/field/rapid-response       — dispatch rapid response unit",
      tasks:    "GET  /api/field/rapid-response/tasks — task queue",
    },
    pdf: {
      invoice:     "GET /api/pdf/invoice/:invoiceId — download invoice PDF",
      po:          "GET /api/pdf/po/:poId           — download purchase order PDF",
      bid:         "GET /api/pdf/bid/:bidId         — download capability statement PDF",
    },
    keyManagement: "POST /admin/keys — issue keys (requires X-Admin-Secret)",
  });
});

apiRouter.get("/health", (_req: Request, res: Response) => {
  // Forward health check to Division 10 controller without going through key gate
  res.redirect("/division/10/system/health");
});

// ── 2. Admin endpoints — X-Admin-Secret (no API key needed) ──────────────────
apiRouter.use("/admin", div0Router);

// ── 2a. Public Stripe endpoints — plans, publishable key, checkout (no API key) ──
// Mounted here (before requireApiKey) so the signup page can access them.
// Key-gated Stripe endpoints (revenue, portal, etc.) require API key and handle
// auth internally via requireApiKey applied per-route inside stripeRouter.
apiRouter.use("/stripe", stripeRouter);

// ── 2a-ii. Public Reseller Signup (no API key — called from /join page) ──────
apiRouter.post("/resellers/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, platform, referralCode, businessName } = req.body;
    if (!name || !email) return res.status(400).json({ error: "name and email are required" });
    const notesParts = [];
    if (businessName) notesParts.push(`Business: ${businessName}`);
    if (referralCode) notesParts.push(`Referral: ${referralCode}`);

    const reseller = await registerReseller({
      name,
      email,
      platform: platform ?? "MULTI",
      notes:    notesParts.length ? notesParts.join(" | ") : undefined,
    });
    return res.status(201).json({
      success:     true,
      resellerId:  reseller.id,
      resellerRef: reseller.resellerRef,
      apiKey:      reseller.apiKey,
      tier:        reseller.tier,
      feeRate:     reseller.feeRate,
      message:     "Welcome to the Loose Arrows Reseller Network. Save your API key — it will not be shown again.",
    });
  } catch (e: any) { return res.status(400).json({ error: e.message }); }
});

// ── 2b. Shopify Webhook — public, verified via HMAC (no API key) ─────────────
// Must be mounted here (before requireApiKey) so Shopify can reach it.
// The raw body parser + HMAC verification live inside the controller.
apiRouter.post(
  "/shopify/webhook",
  expressJson({ verify: (req: any, _res, buf) => { req.rawBody = buf; } }),
  shopifyController.webhook,
);

// ── 2c. Agent Chat — public, no API key required ─────────────────────────────
apiRouter.use("/agent", agentRouter);

// ── 3. API key gate — applied once for everything below ───────────────────────
apiRouter.use(requireApiKey);

// ── 3b. Tier-aware rate limit (runs after key is validated → tier is known) ───
// OBSERVER: 200/15min | OPERATOR: 1 000/15min | ARCHITECT: 5 000/15min
apiRouter.use(tierLimiter);

// ── 4. Division Engine ────────────────────────────────────────────────────────
apiRouter.use("/division/1",   div1Router);
apiRouter.use("/division/2",   div2Router);
apiRouter.use("/division/3",   div3Router);
apiRouter.use("/division/4",   div4Router);
apiRouter.use("/division/5",   div5Router);
apiRouter.use("/division/6",   div6Router);
apiRouter.use("/division/7",   div7Router);
apiRouter.use("/division/8",   div8Router);
apiRouter.use("/division/9",   div9Router);
apiRouter.use("/division/10",  div10Router);

// ── 5. Commerce Automation Layer — TikTok + Instagram + YouTube + Amazon ──────
apiRouter.use("/tiktok",    tikTokRouter);
apiRouter.use("/instagram", instagramRouter);
apiRouter.use("/youtube",   youtubeRouter);
apiRouter.use("/amazon",    amazonRouter);

// Cross-platform aggregate summary
apiRouter.get("/commerce/summary", async (_req: Request, res: Response) => {
  try {
    return res.json(await CommerceService.allPlatformsSummary());
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

// ── 6. Shopify Connector ──────────────────────────────────────────────────────
apiRouter.use("/shopify", shopifyRouter);

// ── 7. SAM.gov Integration ────────────────────────────────────────────────────
apiRouter.use("/sam", samRouter);

// ── 8. Billing & Transaction Fee Engine ───────────────────────────────────────
apiRouter.use("/billing", billingRouter);

// ── 9b. Bitcoin & Crypto Profit Engine ───────────────────────────────────────
apiRouter.use("/crypto", cryptoRouter);

// ── 9c. Reseller Network Engine ───────────────────────────────────────────────
apiRouter.use("/resellers", resellerRouter);

// ── 9. Rapid Response Field Operations ───────────────────────────────────────
apiRouter.use("/field/rapid-response",        rrDispatch);
apiRouter.use("/field/rapid-response/tasks",  rrTask);
apiRouter.use("/field/rapid-response",        rrEvent);
apiRouter.use("/field/rapid-response",        rrOperator);

// ── 10. PDF Document Generation ───────────────────────────────────────────────
apiRouter.use("/pdf", pdfRouter);

export default apiRouter;
