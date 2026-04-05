// master.ts
// Single entry to wire config, engines, routes, and server.
// Run: ts-node master.ts  (or: npm run master)

import path from "path";
import express, { Request, Response, NextFunction } from "express";

// ── 3. Shared infrastructure ──────────────────────────────────────────────────
import { createDbClient } from "./src/infrastructure/dbClient";
import { createLogger } from "./src/infrastructure/logger";
import { loadContractData } from "./src/infrastructure/contractDataLoader";

// ── 4. Engines ────────────────────────────────────────────────────────────────
import { createScoringEngine } from "./src/engines/scoringEngine";
import { createPerformanceEngine } from "./src/engines/performanceEngine";

// ── 5. Routes ─────────────────────────────────────────────────────────────────
import { registerEventRoutes } from "./src/routes/eventRoutes";

// ── 6. Bootstrap ──────────────────────────────────────────────────────────────
async function bootstrap() {
  const app = express();
  const port = process.env.MASTER_PORT || process.env.PORT || 4000;

  // Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.use(express.json());

  // Shared services
  const logger = createLogger();
  const db = await createDbClient({ logger });

  // Domain data (reads JSON snapshot alongside ContractData.pdf if present;
  // falls back to the live in-memory registry automatically)
  const contractData = await loadContractData({
    logger,
    sourcePath: path.join(__dirname, "data", "ContractData.pdf"),
  });

  // Engines
  const scoringEngine = createScoringEngine({ logger, db, contractData });
  const performanceEngine = createPerformanceEngine({ logger, db, contractData });

  // Routes
  registerEventRoutes({
    app,
    logger,
    db,
    scoringEngine,
    contractData,
    performanceEngine,
  });

  // Healthcheck
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", ts: new Date().toISOString() });
  });

  // Start server
  app.listen(Number(port), "0.0.0.0", () => {
    logger.info(`Master server up on port ${port}`);
  });
}

// ── 7. Run ────────────────────────────────────────────────────────────────────
bootstrap().catch((err) => {
  console.error("Fatal bootstrap error:", err);
  process.exit(1);
});
