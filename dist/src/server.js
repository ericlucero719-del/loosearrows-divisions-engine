"use strict";
// src/server.ts
// LooseArrows Supply & Logistics™ — Divisions Engine
// Author: Eric Lucero — Chief Architect & Commander
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
// ── Middleware & Admin ────────────────────────────────────────────────────────
const apiKey_1 = require("./middleware/apiKey");
const rateLimiter_1 = require("./middleware/rateLimiter");
const admin_1 = __importDefault(require("./routes/admin"));
// ── Master API Router (consolidated) ─────────────────────────────────────────
const index_1 = __importDefault(require("./api/index"));
// ── Dashboards (public HTML pages) ───────────────────────────────────────────
const dashboards_routes_1 = __importDefault(require("../modules/dashboards/dashboards.routes"));
// ── Backward-compat aliases (legacy routes stay alive, no integration breaks) ─
const division1_1 = require("./divisions/division1");
const division3_dispatch_1 = require("./divisions/division3-dispatch");
const division2_1 = __importDefault(require("./routes/division2"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const division1Upload_1 = __importDefault(require("./routes/division1Upload"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rrDispatch = require("./routes/rapidResponseDispatchRoute");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rrTask = require("./routes/rapidResponseTaskRoute");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rrEvent = require("./routes/rapidResponseEventRoute");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rrOperator = require("./routes/rapidResponseOperatorRoute");
// ── Division Engine routers (for backward-compat mounts) ─────────────────────
const division0_routes_1 = __importDefault(require("../modules/division0/division0.routes"));
const division1_routes_1 = __importDefault(require("../modules/division1/division1.routes"));
const division2_routes_1 = __importDefault(require("../modules/division2/division2.routes"));
const division3_routes_1 = __importDefault(require("../modules/division3/division3.routes"));
const division4_routes_1 = __importDefault(require("../modules/division4/division4.routes"));
const division5_routes_1 = __importDefault(require("../modules/division5/division5.routes"));
const division6_routes_1 = __importDefault(require("../modules/division6/division6.routes"));
const division7_routes_1 = __importDefault(require("../modules/division7/division7.routes"));
const division8_routes_1 = __importDefault(require("../modules/division8/division8.routes"));
const division9_routes_1 = __importDefault(require("../modules/division9/division9.routes"));
const division10_routes_1 = __importDefault(require("../modules/division10/division10.routes"));
const tiktok_routes_1 = __importDefault(require("../modules/tiktok/tiktok.routes"));
const instagram_routes_1 = __importDefault(require("../modules/instagram/instagram.routes"));
const youtube_routes_1 = __importDefault(require("../modules/youtube/youtube.routes"));
const amazon_routes_1 = __importDefault(require("../modules/amazon/amazon.routes"));
exports.app = (0, express_1.default)();
const port = process.env.PORT || 5000;
exports.app.use(express_1.default.json());
// ── Health check (must be before auth — used by deployment platform) ──────────
exports.app.get("/health", (_req, res) => {
    res.json({ status: "ok", engine: "loosearrows-divisions-engine", ts: new Date().toISOString() });
});
// ── Suppress favicon 404 (no browser alert) ───────────────────────────────────
exports.app.get("/favicon.ico", (_req, res) => res.status(204).end());
// ── Rate limiting — public cap on all routes (tier-aware is applied post-auth inside apiRouter)
exports.app.use(rateLimiter_1.publicLimiter); // 60 req / 15 min for unauthenticated traffic
// ── Static assets ─────────────────────────────────────────────────────────────
exports.app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
// ── Public HTML pages (dashboards, client guide, etc.) ────────────────────────
exports.app.use("/", dashboards_routes_1.default);
// ── Admin key management (X-Admin-Secret, no API key required) ────────────────
exports.app.use("/admin", admin_1.default);
// ── CANONICAL API — single consolidated entry point ───────────────────────────
// Auth applied inside apiRouter: public → admin → key-gate → divisions/tiktok/field
exports.app.use("/api", index_1.default);
// ═════════════════════════════════════════════════════════════════════════════
// BACKWARD-COMPAT ALIASES
// All original paths continue to work. New integrations should use /api/*.
// ═════════════════════════════════════════════════════════════════════════════
// Division 0 — admin only (X-Admin-Secret), no API key
exports.app.use("/division/0", division0_routes_1.default);
// PUBLIC homepage-facing routes — no API key required (these are the customer
// upload + quote endpoints shown on the landing page)
exports.app.use("/division1", division1Upload_1.default);
// Legacy + engine /division/* routes — keep key gate for these old paths
exports.app.use([
    "/division/1", "/division/2", "/division/3", "/division/4", "/division/5",
    "/division/6", "/division/7", "/division/8", "/division/9", "/division/10",
    "/division1", "/division2", "/dashboard", "/dispatch", "/rapid-response", "/field",
    "/tiktok", "/instagram", "/youtube", "/amazon",
], apiKey_1.requireApiKey);
// 10-Division Engine (old paths)
exports.app.use("/division/1", division1_routes_1.default);
exports.app.use("/division/2", division2_routes_1.default);
exports.app.use("/division/3", division3_routes_1.default);
exports.app.use("/division/4", division4_routes_1.default);
exports.app.use("/division/5", division5_routes_1.default);
exports.app.use("/division/6", division6_routes_1.default);
exports.app.use("/division/7", division7_routes_1.default);
exports.app.use("/division/8", division8_routes_1.default);
exports.app.use("/division/9", division9_routes_1.default);
exports.app.use("/division/10", division10_routes_1.default);
exports.app.use("/tiktok", tiktok_routes_1.default);
exports.app.use("/instagram", instagram_routes_1.default);
exports.app.use("/youtube", youtube_routes_1.default);
exports.app.use("/amazon", amazon_routes_1.default);
// Legacy routes (old paths)
exports.app.use("/division1", division1Upload_1.default);
exports.app.use("/division1", division1_1.division1Routes);
exports.app.use("/division2", division2_1.default);
exports.app.use("/dashboard", dashboard_1.default);
exports.app.use("/dispatch", division3_dispatch_1.dispatchRoutes);
exports.app.use("/rapid-response", rrDispatch);
exports.app.use("/field/rapid-response", rrDispatch);
exports.app.use("/field/rapid-response/tasks", rrTask);
exports.app.use("/field/rapid-response", rrEvent);
exports.app.use("/field/rapid-response", rrOperator);
// ── Startup: seed initial Architect key if none exist ────────────────────────
async function seedInitialKey() {
    const prisma = new client_1.PrismaClient();
    try {
        const count = await prisma.apiKey.count({ where: { tier: "ARCHITECT" } });
        if (count === 0) {
            const key = `la-arc-${(0, crypto_1.randomBytes)(18).toString("hex")}`;
            await prisma.apiKey.create({
                data: {
                    key,
                    tier: "ARCHITECT",
                    ownerName: "Admin (Auto-seeded)",
                    notes: "First Architect key — generated on initial boot",
                },
            });
            console.log("\n" + "═".repeat(62));
            console.log("  ★  INITIAL ARCHITECT KEY GENERATED  ★");
            console.log("  Copy this key now — list endpoint masks the middle.");
            console.log(`  Key: ${key}`);
            console.log("  Header: X-API-Key: " + key);
            console.log("═".repeat(62) + "\n");
        }
    }
    catch (e) {
        console.error("[seed] Could not seed initial key:", e);
    }
    finally {
        await prisma.$disconnect();
    }
}
if (require.main === module) {
    seedInitialKey().then(() => {
        exports.app.listen(Number(port), "0.0.0.0", () => {
            console.log(`Server running on port ${port}`);
        });
    });
}
//# sourceMappingURL=server.js.map