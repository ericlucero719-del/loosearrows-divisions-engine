// src/routes/rapidResponseTaskRoute.js

const express = require("express");
const router = express.Router();

const { RapidResponseDispatchEngine } = require("../services/RapidResponseDispatchEngine");
const { RapidResponseTaskService } = require("../services/RapidResponseTaskService");
const { RapidResponseOperatorService } = require("../services/RapidResponseOperatorService");

const operatorService = new RapidResponseOperatorService();

const getAvailableOperators = async () =>
  operatorService.getAll().filter(op => op.status === "AVAILABLE");

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
