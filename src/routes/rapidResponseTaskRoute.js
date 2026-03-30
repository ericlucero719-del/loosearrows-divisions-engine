// src/routes/rapidResponseTaskRoute.js

const express = require("express");
const router = express.Router();

const { RapidResponseDispatchEngine } = require("../services/RapidResponseDispatchEngine");
const { RapidResponseTaskService } = require("../services/RapidResponseTaskService");

// Temporary operator registry
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
const taskService = new RapidResponseTaskService(dispatchEngine);

router.post("/create", async (req, res) => {
  try {
    const task = await taskService.createTask(req.body);
    return res.json(task);
  } catch (err) {
    console.error("Task creation error:", err);
    return res.status(500).json({ error: "Task creation failed" });
  }
});

router.get("/all", (req, res) => {
  return res.json(taskService.getTasks());
});

module.exports = router;
