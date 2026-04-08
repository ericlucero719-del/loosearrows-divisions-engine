// src/routes/rapidResponseEventRoute.js

const express = require("express");
const router = express.Router();

const { RapidResponseHandler } = require("../services/RapidResponseHandler");
const { RapidResponseOperatorService } = require("../services/RapidResponseOperatorService");
const { PerformanceEngine } = require("../services/PerformanceEngine");

const auditWriter = { record: async () => {} };
const analytics = { ingestFieldEvent: async () => {} };
const contractEngine = { alignFieldEvent: async () => {} };
const vendorEngine = { updateFromFieldEvent: async () => {} };
const logisticsEngine = { confirmFieldAction: async () => {} };

const operatorService = new RapidResponseOperatorService();
const performanceEngine = new PerformanceEngine(operatorService);

const handler = new RapidResponseHandler(
  auditWriter,
  analytics,
  contractEngine,
  vendorEngine,
  logisticsEngine,
  performanceEngine
);

router.post("/event", async (req, res) => {
  try {
    const event = req.body;
    const result = await handler.handle(event);
    return res.json(result);
  } catch (err) {
    const status = err.statusCode === 400 ? 400 : 500;
    const message = status === 400 ? err.message : "Event submission failed";
    console.error("Event submission error:", err);
    return res.status(status).json({ error: message });
  }
});

module.exports = router;
