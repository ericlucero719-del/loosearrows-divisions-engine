// src/routes/eventRoutes.ts
// Event ingestion and query routes wired to scoringEngine + performanceEngine.

import { Application, Request, Response } from "express";
import { randomUUID } from "crypto";
import { Logger } from "../infrastructure/logger";
import { DbClient } from "../infrastructure/dbClient";
import { ScoringEngine } from "../engines/scoringEngine";
import { PerformanceEngineHandle } from "../engines/performanceEngine";
import { ContractData } from "../infrastructure/contractDataLoader";

const eventLog: any[] = [];

export function registerEventRoutes({
  app,
  logger,
  db,
  scoringEngine,
  contractData,
  performanceEngine,
}: {
  app: Application;
  logger: Logger;
  db: DbClient;
  scoringEngine: ScoringEngine;
  contractData: ContractData;
  performanceEngine: PerformanceEngineHandle;
}) {
  // POST /events — ingest a field event, score it, update operator performance
  app.post("/events", async (req: Request, res: Response) => {
    try {
      const event = {
        id: randomUUID(),
        timestamp: Date.now(),
        division: "FIELD_RAPID_RESPONSE" as const,
        ...req.body,
      };

      const scoring = scoringEngine.score(event);
      const performance = await performanceEngine.evaluate(event);

      const record = { event, scoring, performance };
      eventLog.push(record);

      logger.info("Event ingested", { id: event.id, operatorId: event.operatorId });
      res.status(201).json(record);
    } catch (err: any) {
      logger.error("Failed to process event", { error: err.message });
      res.status(500).json({ error: err.message });
    }
  });

  // GET /events — return all ingested events for this session
  app.get("/events", (_req: Request, res: Response) => {
    res.json({ count: eventLog.length, events: eventLog });
  });

  // GET /events/:id — single event lookup
  app.get("/events/:id", (req: Request, res: Response) => {
    const record = eventLog.find(r => r.event.id === req.params.id);
    if (!record) return res.status(404).json({ error: "Event not found" });
    res.json(record);
  });

  // GET /contracts — expose loaded contract reference data
  app.get("/contracts", (_req: Request, res: Response) => {
    res.json({
      contracts: Object.keys(contractData.contracts).length,
      naicsCodes: contractData.naicsCodes,
      clins: contractData.clins,
    });
  });

  logger.info("Event routes registered", {
    routes: ["POST /events", "GET /events", "GET /events/:id", "GET /contracts"],
  });
}
