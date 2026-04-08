"use strict";
// src/routes/eventRoutes.ts
// Event ingestion and query routes wired to scoringEngine + performanceEngine.
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEventRoutes = registerEventRoutes;
const crypto_1 = require("crypto");
const eventLog = [];
function registerEventRoutes({ app, logger, db, scoringEngine, contractData, performanceEngine, }) {
    // POST /events — ingest a field event, score it, update operator performance
    app.post("/events", async (req, res) => {
        try {
            const event = {
                id: (0, crypto_1.randomUUID)(),
                timestamp: Date.now(),
                division: "FIELD_RAPID_RESPONSE",
                ...req.body,
            };
            const scoring = scoringEngine.score(event);
            const performance = await performanceEngine.evaluate(event);
            const record = { event, scoring, performance };
            eventLog.push(record);
            logger.info("Event ingested", { id: event.id, operatorId: event.operatorId });
            res.status(201).json(record);
        }
        catch (err) {
            logger.error("Failed to process event", { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });
    // GET /events — return all ingested events for this session
    app.get("/events", (_req, res) => {
        res.json({ count: eventLog.length, events: eventLog });
    });
    // GET /events/:id — single event lookup
    app.get("/events/:id", (req, res) => {
        const record = eventLog.find(r => r.event.id === req.params.id);
        if (!record)
            return res.status(404).json({ error: "Event not found" });
        res.json(record);
    });
    // GET /contracts — expose loaded contract reference data
    app.get("/contracts", (_req, res) => {
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
//# sourceMappingURL=eventRoutes.js.map