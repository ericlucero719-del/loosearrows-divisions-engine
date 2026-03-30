// setup-rapid-response-task-flow.js
// Run with: node setup-rapid-response-task-flow.js

const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src");
const modelsDir = path.join(srcDir, "models");
const servicesDir = path.join(srcDir, "services");
const routesDir = path.join(srcDir, "routes");

// Ensure directories exist
for (const dir of [srcDir, modelsDir, servicesDir, routesDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log(`Created folder: ${dir}`);
  }
}

// --------------------
// Task Model
// --------------------
const taskModelFile = path.join(modelsDir, "RapidResponseTask.ts");

const taskModelCode = `// src/models/RapidResponseTask.ts

export interface RapidResponseTask {
  id: string;
  taskType: string;
  contractPriority?: number;
  vendorRisk?: number;
  operationalUrgency?: number;
  location: { lat: number; lng: number };
  description?: string;
  createdAt: number;
  assignedOperatorId?: string;
}
`;

fs.writeFileSync(taskModelFile, taskModelCode, "utf8");
console.log("Wrote:", taskModelFile);

// --------------------
// Task Service
// --------------------
const taskServiceFile = path.join(servicesDir, "RapidResponseTaskService.ts");

const taskServiceCode = `// src/services/RapidResponseTaskService.ts

import { RapidResponseTask } from "../models/RapidResponseTask";
import { RapidResponseDispatchEngine } from "./RapidResponseDispatchEngine";
import { RapidResponseTaskType } from "../models/RapidResponseEvent";

export class RapidResponseTaskService {
  private tasks: RapidResponseTask[] = [];

  constructor(private dispatchEngine: RapidResponseDispatchEngine) {}

  async createTask(taskData: Omit<RapidResponseTask, "id" | "createdAt">) {
    const task: RapidResponseTask = {
      ...taskData,
      id: "task-" + Date.now(),
      createdAt: Date.now(),
    };

    const decision = await this.dispatchEngine.dispatch(task.taskType as RapidResponseTaskType, {
      contractPriority: task.contractPriority,
      vendorRisk: task.vendorRisk,
      operationalUrgency: task.operationalUrgency,
    });

    if (decision) {
      task.assignedOperatorId = decision.operatorId;
    }

    this.tasks.push(task);
    return task;
  }

  getTasks() {
    return this.tasks;
  }
}
`;

fs.writeFileSync(taskServiceFile, taskServiceCode, "utf8");
console.log("Wrote:", taskServiceFile);

// --------------------
// Task API Route
// --------------------
const taskRouteFile = path.join(routesDir, "rapidResponseTaskRoute.js");

const taskRouteCode = `// src/routes/rapidResponseTaskRoute.js

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
`;

fs.writeFileSync(taskRouteFile, taskRouteCode, "utf8");
console.log("Wrote:", taskRouteFile);

console.log("Rapid-Response Task Flow created.");
