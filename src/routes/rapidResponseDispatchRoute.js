// src/routes/rapidResponseDispatchRoute.js

const express = require("express");
const router = express.Router();

const { RapidResponseDispatchEngine } = require("../services/RapidResponseDispatchEngine");

// Temporary operator registry (replace with DB later)
const operators = [
  {
    id: "op-001",
    name: "Operator One",
    tier: "ELITE",
    status: "AVAILABLE",
    lat: 38.8339,
    lng: -104.8214,
    performanceScore: 95
  },
  {
    id: "op-002",
    name: "Operator Two",
    tier: "SENIOR",
    status: "AVAILABLE",
    lat: 38.85,
    lng: -104.82,
    performanceScore: 88
  }
];

const getAvailableOperators = async () => operators;

const dispatchEngine = new RapidResponseDispatchEngine(getAvailableOperators);

router.post("/dispatch", async (req, res) => {
  try {
    const { taskType, contractPriority, vendorRisk, operationalUrgency } = req.body;

    const decision = await dispatchEngine.dispatch(taskType, {
      contractPriority,
      vendorRisk,
      operationalUrgency
    });

    if (!decision) {
      return res.status(404).json({ error: "No available operators" });
    }

    return res.json({
      assignedOperator: decision.operatorId,
      priorityScore: decision.priorityScore,
      reason: decision.reason
    });
  } catch (err) {
    console.error("Dispatch error:", err);
    return res.status(500).json({ error: "Dispatch failed" });
  }
});

module.exports = router;
