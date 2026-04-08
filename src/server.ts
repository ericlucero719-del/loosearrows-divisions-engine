// src/server.ts
// LooseArrows Supply & Logistics™ — Divisions Engine
// Author: Eric Lucero — Chief Architect & Commander

import express from "express";
import path    from "path";
import { PrismaClient } from "@prisma/client";
import { randomBytes }  from "crypto";

// ── Middleware & Admin ────────────────────────────────────────────────────────
import { requireApiKey }  from "./middleware/apiKey";
import { publicLimiter, tierLimiter } from "./middleware/rateLimiter";
import adminRouter       from "./routes/admin";

// ── Master API Router (consolidated) ─────────────────────────────────────────
import apiRouter from "./api/index";

// ── Dashboards (public HTML pages) ───────────────────────────────────────────
import dashboardsRouter from "../modules/dashboards/dashboards.routes";

// ── Backward-compat aliases (legacy routes stay alive, no integration breaks) ─
import { division1Routes }  from "./divisions/division1";
import { dispatchRoutes }   from "./divisions/division3-dispatch";
import division2Router      from "./routes/division2";
import dashboardRouter      from "./routes/dashboard";
import division1UploadRouter from "./routes/division1Upload";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rrDispatch = require("./routes/rapidResponseDispatchRoute");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rrTask     = require("./routes/rapidResponseTaskRoute");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rrEvent    = require("./routes/rapidResponseEventRoute");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rrOperator = require("./routes/rapidResponseOperatorRoute");

// ── Division Engine routers (for backward-compat mounts) ─────────────────────
import div0Router  from "../modules/division0/division0.routes";
import div1Router  from "../modules/division1/division1.routes";
import div2Router  from "../modules/division2/division2.routes";
import div3Router  from "../modules/division3/division3.routes";
import div4Router  from "../modules/division4/division4.routes";
import div5Router  from "../modules/division5/division5.routes";
import div6Router  from "../modules/division6/division6.routes";
import div7Router  from "../modules/division7/division7.routes";
import div8Router  from "../modules/division8/division8.routes";
import div9Router  from "../modules/division9/division9.routes";
import div10Router from "../modules/division10/division10.routes";
import tikTokRouter    from "../modules/tiktok/tiktok.routes";
import instagramRouter from "../modules/instagram/instagram.routes";
import youtubeRouter   from "../modules/youtube/youtube.routes";
import amazonRouter    from "../modules/amazon/amazon.routes";

export const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// ── Health check (must be before auth — used by deployment platform) ──────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", engine: "loosearrows-divisions-engine", ts: new Date().toISOString() });
});

// ── Suppress favicon 404 (no browser alert) ───────────────────────────────────
app.get("/favicon.ico", (_req, res) => res.status(204).end());

// ── Rate limiting — public cap on all routes (tier-aware is applied post-auth inside apiRouter)
app.use(publicLimiter);           // 60 req / 15 min for unauthenticated traffic

// ── Static assets ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "..", "public")));

// ── Public HTML pages (dashboards, client guide, etc.) ────────────────────────
app.use("/", dashboardsRouter);

// ── Admin key management (X-Admin-Secret, no API key required) ────────────────
app.use("/admin", adminRouter);

// ── CANONICAL API — single consolidated entry point ───────────────────────────
// Auth applied inside apiRouter: public → admin → key-gate → divisions/tiktok/field
app.use("/api", apiRouter);

// ═════════════════════════════════════════════════════════════════════════════
// BACKWARD-COMPAT ALIASES
// All original paths continue to work. New integrations should use /api/*.
// ═════════════════════════════════════════════════════════════════════════════

// Division 0 — admin only (X-Admin-Secret), no API key
app.use("/division/0", div0Router);

// PUBLIC homepage-facing routes — no API key required (these are the customer
// upload + quote endpoints shown on the landing page)
app.use("/division1", division1UploadRouter);

// Legacy + engine /division/* routes — keep key gate for these old paths
app.use([
  "/division/1", "/division/2", "/division/3", "/division/4", "/division/5",
  "/division/6", "/division/7", "/division/8", "/division/9", "/division/10",
  "/division1", "/division2", "/dashboard", "/dispatch", "/rapid-response", "/field",
  "/tiktok", "/instagram", "/youtube", "/amazon",
], requireApiKey);

// 10-Division Engine (old paths)
app.use("/division/1",  div1Router);
app.use("/division/2",  div2Router);
app.use("/division/3",  div3Router);
app.use("/division/4",  div4Router);
app.use("/division/5",  div5Router);
app.use("/division/6",  div6Router);
app.use("/division/7",  div7Router);
app.use("/division/8",  div8Router);
app.use("/division/9",  div9Router);
app.use("/division/10", div10Router);
app.use("/tiktok",      tikTokRouter);
app.use("/instagram",   instagramRouter);
app.use("/youtube",     youtubeRouter);
app.use("/amazon",      amazonRouter);

// Legacy routes (old paths)
app.use("/division1",   division1UploadRouter);
app.use("/division1",   division1Routes);
app.use("/division2",   division2Router);
app.use("/dashboard",   dashboardRouter);
app.use("/dispatch",    dispatchRoutes);
app.use("/rapid-response",                  rrDispatch);
app.use("/field/rapid-response",            rrDispatch);
app.use("/field/rapid-response/tasks",      rrTask);
app.use("/field/rapid-response",            rrEvent);
app.use("/field/rapid-response",            rrOperator);

// ── Startup: seed initial Architect key if none exist ────────────────────────
async function seedInitialKey() {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.apiKey.count({ where: { tier: "ARCHITECT" } });
    if (count === 0) {
      const key = `la-arc-${randomBytes(18).toString("hex")}`;
      await prisma.apiKey.create({
        data: {
          key,
          tier:      "ARCHITECT",
          ownerName: "Admin (Auto-seeded)",
          notes:     "First Architect key — generated on initial boot",
        },
      });
      console.log("\n" + "═".repeat(62));
      console.log("  ★  INITIAL ARCHITECT KEY GENERATED  ★");
      console.log("  Copy this key now — list endpoint masks the middle.");
      console.log(`  Key: ${key}`);
      console.log("  Header: X-API-Key: " + key);
      console.log("═".repeat(62) + "\n");
    }
  } catch (e) {
    console.error("[seed] Could not seed initial key:", e);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedInitialKey().then(() => {
    app.listen(Number(port), "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
    });
  });
}
