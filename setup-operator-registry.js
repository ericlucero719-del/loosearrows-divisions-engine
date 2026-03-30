// setup-operator-registry.js
// Run with: node setup-operator-registry.js

const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src");
const modelsDir = path.join(srcDir, "models");
const servicesDir = path.join(srcDir, "services");
const routesDir = path.join(srcDir, "routes");
const dataDir = path.join(srcDir, "data");

// Ensure directories exist
for (const dir of [srcDir, modelsDir, servicesDir, routesDir, dataDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log(`Created folder: ${dir}`);
  }
}

// --------------------
// Operator Model
// --------------------
const operatorModelFile = path.join(modelsDir, "RapidResponseOperator.ts");

const operatorModelCode = `// src/models/RapidResponseOperator.ts

export type OperatorTier = "ELITE" | "SENIOR" | "STANDARD";
export type OperatorStatus = "AVAILABLE" | "BUSY" | "OFFLINE";

export interface RapidResponseOperator {
  id: string;
  name: string;
  tier: OperatorTier;
  status: OperatorStatus;
  lat: number;
  lng: number;
  performanceScore: number;
}
`;

fs.writeFileSync(operatorModelFile, operatorModelCode, "utf8");
console.log("Wrote:", operatorModelFile);

// --------------------
// Operator Service
// --------------------
const operatorServiceFile = path.join(servicesDir, "RapidResponseOperatorService.ts");

const operatorServiceCode = `// src/services/RapidResponseOperatorService.ts

import fs from "fs";
import path from "path";
import { RapidResponseOperator } from "../models/RapidResponseOperator";

export class RapidResponseOperatorService {
  private filePath = path.join(__dirname, "..", "data", "operators.json");

  constructor() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  private load(): RapidResponseOperator[] {
    return JSON.parse(fs.readFileSync(this.filePath, "utf8"));
  }

  private save(operators: RapidResponseOperator[]) {
    fs.writeFileSync(this.filePath, JSON.stringify(operators, null, 2));
  }

  getAll(): RapidResponseOperator[] {
    return this.load();
  }

  add(operator: RapidResponseOperator) {
    const operators = this.load();
    operators.push(operator);
    this.save(operators);
    return operator;
  }

  update(id: string, updates: Partial<RapidResponseOperator>) {
    const operators = this.load();
    const index = operators.findIndex(op => op.id === id);
    if (index === -1) return null;

    operators[index] = { ...operators[index], ...updates };
    this.save(operators);
    return operators[index];
  }
}
`;

fs.writeFileSync(operatorServiceFile, operatorServiceCode, "utf8");
console.log("Wrote:", operatorServiceFile);

// --------------------
// Operator API Route
// --------------------
const operatorRouteFile = path.join(routesDir, "rapidResponseOperatorRoute.js");

const operatorRouteCode = `// src/routes/rapidResponseOperatorRoute.js

const express = require("express");
const router = express.Router();

const { RapidResponseOperatorService } = require("../services/RapidResponseOperatorService");

const operatorService = new RapidResponseOperatorService();

router.get("/operators", (req, res) => {
  return res.json(operatorService.getAll());
});

router.post("/operators", (req, res) => {
  const operator = req.body;
  const created = operatorService.add(operator);
  return res.json(created);
});

router.patch("/operators/:id", (req, res) => {
  const updated = operatorService.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Operator not found" });
  return res.json(updated);
});

module.exports = router;
`;

fs.writeFileSync(operatorRouteFile, operatorRouteCode, "utf8");
console.log("Wrote:", operatorRouteFile);

console.log("Operator Registry created.");
