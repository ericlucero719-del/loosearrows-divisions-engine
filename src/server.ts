import express from "express";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

// ── Auth middleware + Admin routes ────────────────────────────────────────────
import { requireApiKey } from "./middleware/apiKey";
import adminRouter from "./routes/admin";

// ── Legacy routes (preserved) ────────────────────────────────────────────────
import { division1Routes } from './divisions/division1';
import { dispatchRoutes } from './divisions/division3-dispatch';
import division2Router from "./routes/division2";
import dashboardRouter from "./routes/dashboard";
import division1UploadRouter from "./routes/division1Upload";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rapidResponseDispatchRoute = require("./routes/rapidResponseDispatchRoute");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rapidResponseTaskRoute = require("./routes/rapidResponseTaskRoute");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rapidResponseEventRoute = require("./routes/rapidResponseEventRoute");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rapidResponseOperatorRoute = require("./routes/rapidResponseOperatorRoute");

// ── 10-Division Engine ───────────────────────────────────────────────────────
import div0Router from "../modules/division0/division0.routes";
import tikTokRouter from "../modules/tiktok/tiktok.routes";
import tiktokAutomation from "../modules/tiktokAutomation";
import div1Router from "../modules/division1/division1.routes";
import div2Router from "../modules/division2/division2.routes";
import div3Router from "../modules/division3/division3.routes";
import div4Router from "../modules/division4/division4.routes";
import div5Router from "../modules/division5/division5.routes";
import div6Router from "../modules/division6/division6.routes";
import div7Router from "../modules/division7/division7.routes";
import div8Router from "../modules/division8/division8.routes";
import div9Router from "../modules/division9/division9.routes";
import div10Router from "../modules/division10/division10.routes";
import dashboardsRouter from "../modules/dashboards/dashboards.routes";

export const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// ── Static frontend (always public) ──────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Admin key management (protected by X-Admin-Secret, no API key needed) ────
app.use("/admin", adminRouter);

// ── Public API docs ───────────────────────────────────────────────────────────
app.get("/api", (_req, res) => {
  res.json({
    message:  "Loose Arrows Divisions Engine — API",
    auth:     "All /division/* endpoints require X-API-Key header.",
    tiers:    { OBSERVER: "read-only", OPERATOR: "full pipeline", ARCHITECT: "full + bot" },
    health:   "GET /division/10/system/health — no key required",
    admin:    "POST /admin/keys — issue keys (requires X-Admin-Secret header)",
    engine:   "10-Division Operational Engine v2.0",
    divisions: {
      0: "/division/0  — System Command Center (admin-only)",
      1: "/division/1  — Product Intake & Pricing",
      2: "/division/2  — Contract Alignment",
      3: "/division/3  — Requests & Work Orders",
      4: "/division/4  — Inventory & Assets",
      5: "/division/5  — Logistics & Fulfillment",
      6: "/division/6  — Compliance & Documentation",
      7: "/division/7  — Vendor & Partner Management",
      8: "/division/8  — Agency / Customer Management",
      9: "/division/9  — Financials",
      10: "/division/10 — Intelligence & System View",
    },
  });
});

// ── Public dashboard HTML pages (content gated by API key at the JS level) ───
app.use("/", dashboardsRouter);

// ── API Key gate — applied to ALL division and legacy API routes ──────────────
app.use([
  "/division/1", "/division/2", "/division/3", "/division/4", "/division/5",
  "/division/6", "/division/7", "/division/8", "/division/9", "/division/10",
  "/division1", "/division2", "/dashboard", "/dispatch", "/rapid-response", "/field",
], requireApiKey);

// ── Legacy API routes (key-gated) ────────────────────────────────────────────
app.use('/division1', division1UploadRouter);
app.use('/division1', division1Routes);
app.use("/division2", division2Router);
app.use("/dashboard", dashboardRouter);
app.use("/dispatch", dispatchRoutes);
app.use("/rapid-response", rapidResponseDispatchRoute);
app.use("/field/rapid-response", rapidResponseDispatchRoute);
app.use("/field/rapid-response/tasks", rapidResponseTaskRoute);
app.use("/field/rapid-response", rapidResponseEventRoute);
app.use("/field/rapid-response", rapidResponseOperatorRoute);

// ── 10-Division Engine routes (key-gated) ────────────────────────────────────
app.use("/division/0",  div0Router);
app.use("/tiktok",      tikTokRouter);
app.use("/api",         tiktokAutomation);
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
    app.listen(Number(port), '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });
  });
}
