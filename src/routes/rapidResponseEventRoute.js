// src/routes/rapidResponseEventRoute.js

const express = require("express");
const router = express.Router();

const { RapidResponseHandler } = require("../services/RapidResponseHandler");

// Placeholder engines (replace with real ones later)
const auditWriter = { record: async () => {} };
const analytics = { ingestFieldEvent: async () => {} };
const contractEngine = { alignFieldEvent: async () => {} };
const vendorEngine = { updateFromFieldEvent: async () => {} };
const logisticsEngine = { confirmFieldAction: async () => {} };

const handler = new RapidResponseHandler(
  auditWriter,
  analytics,
  contractEngine,
  vendorEngine,
  logisticsEngine
);

router.post("/event", async (req, res) => {
  try {
    const event = req.body;
    const result = await handler.handle(event);
    return res.json(result);
  } catch (err) {
    console.error("Event submission error:", err);
    return res.status(500).json({ error: "Event submission failed" });
  }
});

module.exports = router;
