// setup-rapid-response-event-api.js
// Run with: node setup-rapid-response-event-api.js

const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src");
const routesDir = path.join(srcDir, "routes");
const servicesDir = path.join(srcDir, "services");

// Ensure directories exist
for (const dir of [srcDir, routesDir, servicesDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log(`Created folder: ${dir}`);
  }
}

const eventRouteFile = path.join(routesDir, "rapidResponseEventRoute.js");

const eventRouteCode = `// src/routes/rapidResponseEventRoute.js

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
`;

fs.writeFileSync(eventRouteFile, eventRouteCode, "utf8");
console.log("Wrote:", eventRouteFile);
console.log("Rapid-Response Event Submission API created.");
