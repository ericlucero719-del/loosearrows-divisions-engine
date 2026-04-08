"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiKey_1 = require("../middleware/apiKey");
const rateLimiter_1 = require("../middleware/rateLimiter");
const pdf_routes_1 = __importDefault(require("../../modules/pdf/pdf.routes"));
// ── Division Engine routers ───────────────────────────────────────────────────
const division0_routes_1 = __importDefault(require("../../modules/division0/division0.routes"));
const division1_routes_1 = __importDefault(require("../../modules/division1/division1.routes"));
const division2_routes_1 = __importDefault(require("../../modules/division2/division2.routes"));
const division3_routes_1 = __importDefault(require("../../modules/division3/division3.routes"));
const division4_routes_1 = __importDefault(require("../../modules/division4/division4.routes"));
const division5_routes_1 = __importDefault(require("../../modules/division5/division5.routes"));
const division6_routes_1 = __importDefault(require("../../modules/division6/division6.routes"));
const division7_routes_1 = __importDefault(require("../../modules/division7/division7.routes"));
const division8_routes_1 = __importDefault(require("../../modules/division8/division8.routes"));
const division9_routes_1 = __importDefault(require("../../modules/division9/division9.routes"));
const division10_routes_1 = __importDefault(require("../../modules/division10/division10.routes"));
const tiktok_routes_1 = __importDefault(require("../../modules/tiktok/tiktok.routes"));
const instagram_routes_1 = __importDefault(require("../../modules/instagram/instagram.routes"));
const youtube_routes_1 = __importDefault(require("../../modules/youtube/youtube.routes"));
const amazon_routes_1 = __importDefault(require("../../modules/amazon/amazon.routes"));
const commerce_service_1 = require("../../modules/commerce/commerce.service");
const shopify_routes_1 = __importDefault(require("../../modules/shopify/shopify.routes"));
const sam_routes_1 = __importDefault(require("../../modules/sam/sam.routes"));
const billing_routes_1 = __importDefault(require("../../modules/billing/billing.routes"));
// ── Rapid Response (legacy CommonJS) ─────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rrDispatch = require("../routes/rapidResponseDispatchRoute");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rrTask = require("../routes/rapidResponseTaskRoute");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rrEvent = require("../routes/rapidResponseEventRoute");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rrOperator = require("../routes/rapidResponseOperatorRoute");
const apiRouter = (0, express_1.Router)();
// ── 1. Public endpoints — must come BEFORE the key gate ──────────────────────
apiRouter.get("/", (_req, res) => {
    res.json({
        engine: "Loose Arrows Divisions Engine v2.0",
        company: "Loose Arrows Supply & Logistics™",
        auth: {
            header: "X-API-Key",
            tiers: { OBSERVER: "read-only GET", OPERATOR: "full pipeline", ARCHITECT: "full + bot commands" },
            adminOnly: "X-Admin-Secret header required for /api/admin/*",
        },
        public: [
            "GET  /api              — this document",
            "GET  /api/health       — system health (all 11 divisions)",
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
            1: "GET|POST  /api/division/1   — Product Intake & Pricing",
            2: "GET|POST  /api/division/2   — Contract Alignment",
            3: "GET|POST  /api/division/3   — Requests & Work Orders",
            4: "GET|POST  /api/division/4   — Inventory & Assets",
            5: "GET|POST  /api/division/5   — Logistics & Fulfillment",
            6: "GET|POST  /api/division/6   — Compliance & Documentation",
            7: "GET|POST  /api/division/7   — Vendor & Partner Management",
            8: "GET|POST  /api/division/8   — Agency / Customer Management",
            9: "GET|POST  /api/division/9   — Financials",
            10: "GET|POST  /api/division/10  — Intelligence & System View (bot: ARCHITECT only)",
        },
        commerce: {
            note: "All 4 platforms share the same 5-step pipeline — only the URL prefix differs",
            allSummary: "GET  /api/commerce/summary         — cross-platform aggregate (revenue/profit/orders by platform)",
            platforms: ["tiktok", "instagram", "youtube", "amazon"],
            endpoints: {
                capture: "POST /api/<platform>/order              — ingest order → SKU match → profit → auto PO",
                fulfill: "POST /api/<platform>/fulfill             — home (label+tracking) | supplier push",
                invoice: "POST /api/<platform>/invoice             — generate Division 9 invoice",
                payment: "POST /api/<platform>/payment             — record payment, mark invoice PAID",
                notify: "POST /api/<platform>/notify              — log event + sync Division 1 inventory",
                orders: "GET  /api/<platform>/orders              — list orders (?status= filter)",
                order: "GET  /api/<platform>/orders/:id          — full order detail",
                summary: "GET  /api/<platform>/summary             — per-platform revenue / profit / breakdown",
            },
        },
        field: {
            dispatch: "POST /api/field/rapid-response       — dispatch rapid response unit",
            tasks: "GET  /api/field/rapid-response/tasks — task queue",
        },
        pdf: {
            invoice: "GET /api/pdf/invoice/:invoiceId — download invoice PDF",
            po: "GET /api/pdf/po/:poId           — download purchase order PDF",
            bid: "GET /api/pdf/bid/:bidId         — download capability statement PDF",
        },
        keyManagement: "POST /admin/keys — issue keys (requires X-Admin-Secret)",
    });
});
apiRouter.get("/health", (_req, res) => {
    // Forward health check to Division 10 controller without going through key gate
    res.redirect("/division/10/system/health");
});
// ── 2. Admin endpoints — X-Admin-Secret (no API key needed) ──────────────────
apiRouter.use("/admin", division0_routes_1.default);
// ── 3. API key gate — applied once for everything below ───────────────────────
apiRouter.use(apiKey_1.requireApiKey);
// ── 3b. Tier-aware rate limit (runs after key is validated → tier is known) ───
// OBSERVER: 200/15min | OPERATOR: 1 000/15min | ARCHITECT: 5 000/15min
apiRouter.use(rateLimiter_1.tierLimiter);
// ── 4. Division Engine ────────────────────────────────────────────────────────
apiRouter.use("/division/1", division1_routes_1.default);
apiRouter.use("/division/2", division2_routes_1.default);
apiRouter.use("/division/3", division3_routes_1.default);
apiRouter.use("/division/4", division4_routes_1.default);
apiRouter.use("/division/5", division5_routes_1.default);
apiRouter.use("/division/6", division6_routes_1.default);
apiRouter.use("/division/7", division7_routes_1.default);
apiRouter.use("/division/8", division8_routes_1.default);
apiRouter.use("/division/9", division9_routes_1.default);
apiRouter.use("/division/10", division10_routes_1.default);
// ── 5. Commerce Automation Layer — TikTok + Instagram + YouTube + Amazon ──────
apiRouter.use("/tiktok", tiktok_routes_1.default);
apiRouter.use("/instagram", instagram_routes_1.default);
apiRouter.use("/youtube", youtube_routes_1.default);
apiRouter.use("/amazon", amazon_routes_1.default);
// Cross-platform aggregate summary
apiRouter.get("/commerce/summary", async (_req, res) => {
    try {
        return res.json(await commerce_service_1.CommerceService.allPlatformsSummary());
    }
    catch (e) {
        return res.status(500).json({ error: e.message });
    }
});
// ── 6. Shopify Connector ──────────────────────────────────────────────────────
apiRouter.use("/shopify", shopify_routes_1.default);
// ── 7. SAM.gov Integration ────────────────────────────────────────────────────
apiRouter.use("/sam", sam_routes_1.default);
// ── 8. Billing & Transaction Fee Engine ───────────────────────────────────────
apiRouter.use("/billing", billing_routes_1.default);
// ── 9. Rapid Response Field Operations ───────────────────────────────────────
apiRouter.use("/field/rapid-response", rrDispatch);
apiRouter.use("/field/rapid-response/tasks", rrTask);
apiRouter.use("/field/rapid-response", rrEvent);
apiRouter.use("/field/rapid-response", rrOperator);
// ── 10. PDF Document Generation ───────────────────────────────────────────────
apiRouter.use("/pdf", pdf_routes_1.default);
exports.default = apiRouter;
//# sourceMappingURL=index.js.map