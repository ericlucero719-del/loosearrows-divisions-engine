// src/routes/rapidResponseDispatchRoute.js

const express = require("express");
const router = express.Router();

const { RapidResponseDispatchEngine } = require("../services/RapidResponseDispatchEngine");
const { RapidResponseOperatorService } = require("../services/RapidResponseOperatorService");

const operatorService = new RapidResponseOperatorService();

const getAvailableOperators = async () =>
  operatorService.getAll().filter(op => op.status === "AVAILABLE");

const dispatchEngine = new RapidResponseDispatchEngine(getAvailableOperators);

router.post("/dispatch", async (req, res) => {
  try {
    const { taskType, contractPriority, vendorRisk, operationalUrgency } = req.body;

    const decision = await dispatchEngine.dispatch(taskType, {
      contractPriority,
      vendorRisk,
      operationalUrgency,
    });

    if (!decision) {
      return res.status(404).json({ error: "No available operators" });
    }

    return res.json({
      assignedOperator: decision.operatorId,
      priorityScore: decision.priorityScore,
      reason: decision.reason,
    });
  } catch (err) {
    console.error("Dispatch error:", err);
    return res.status(500).json({ error: "Dispatch failed" });
  }
});

module.exports = router;
