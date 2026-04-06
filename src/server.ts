import express from "express";
import path from "path";

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
const port = process.env.PORT || 3000;

app.use(express.json());

// ── Static frontend ──────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Legacy API routes ────────────────────────────────────────────────────────
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

// ── 10-Division Engine routes ─────────────────────────────────────────────────
app.use("/division/1", div1Router);   // Product Intake & Pricing
app.use("/division/2", div2Router);   // Contract Alignment
app.use("/division/3", div3Router);   // Requests & Work Orders
app.use("/division/4", div4Router);   // Inventory & Assets
app.use("/division/5", div5Router);   // Logistics & Fulfillment
app.use("/division/6", div6Router);   // Compliance & Documentation
app.use("/division/7", div7Router);   // Vendor & Partner Management
app.use("/division/8", div8Router);   // Agency / Customer Management
app.use("/division/9", div9Router);   // Financials
app.use("/division/10", div10Router); // Intelligence & System View
app.use("/", dashboardsRouter);       // Vendor Cockpit + Operator Control Room

// ── Root API ─────────────────────────────────────────────────────────────────
app.get("/api", (_req, res) => {
  res.json({
    message: "Welcome to Loose Arrows Divisions Engine",
    engine: "10-Division Operational Engine",
    divisions: {
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

if (require.main === module) {
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}
