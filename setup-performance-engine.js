// setup-performance-engine.js
// Run with: node setup-performance-engine.js

const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src");
const servicesDir = path.join(srcDir, "services");
const modelsDir = path.join(srcDir, "models");

// Ensure directories exist
for (const dir of [srcDir, servicesDir, modelsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log(`Created folder: ${dir}`);
  }
}

// --------------------
// Performance Engine
// --------------------
const performanceFile = path.join(servicesDir, "PerformanceEngine.ts");

const performanceCode = `// src/services/PerformanceEngine.ts

import { RapidResponseEvent } from "../models/RapidResponseEvent";
import { RapidResponseOperatorService } from "./RapidResponseOperatorService";

export class PerformanceEngine {
  constructor(private operatorService: RapidResponseOperatorService) {}

  async evaluate(event: RapidResponseEvent) {
    const operators = this.operatorService.getAll();
    const operator = operators.find(op => op.id === event.operatorId);
    if (!operator) return;

    const scoreDelta = this.computeScoreDelta(event);
    const newScore = Math.max(0, Math.min(100, operator.performanceScore + scoreDelta));

    const updated = this.operatorService.update(operator.id, {
      performanceScore: newScore,
      tier: this.computeTier(newScore)
    });

    return updated;
  }

  private computeScoreDelta(event: RapidResponseEvent): number {
    let delta = 0;

    if (event.payload?.completed === true) delta += 5;
    if (event.payload?.onTime === true) delta += 5;
    if (event.payload?.accuracy === "HIGH") delta += 5;
    if (event.payload?.accuracy === "LOW") delta -= 5;
    if (event.payload?.missingData === true) delta -= 3;
    if (event.payload?.escalated === true) delta -= 2;

    return delta;
  }

  private computeTier(score: number) {
    if (score >= 90) return "ELITE";
    if (score >= 70) return "SENIOR";
    return "STANDARD";
  }
}
`;

fs.writeFileSync(performanceFile, performanceCode, "utf8");
console.log("Wrote:", performanceFile);

// --------------------
// Patch RapidResponseHandler to use PerformanceEngine
// --------------------
const handlerPath = path.join(servicesDir, "RapidResponseHandler.ts");
let handlerContent = fs.readFileSync(handlerPath, "utf8");

if (!handlerContent.includes("PerformanceEngine")) {
  handlerContent = handlerContent.replace(
    "export class RapidResponseHandler {",
    `import { PerformanceEngine } from "./PerformanceEngine";
export class RapidResponseHandler {`
  );

  handlerContent = handlerContent.replace(
    "private logisticsEngine: LogisticsEngine",
    "private logisticsEngine: LogisticsEngine,\n    private performanceEngine: PerformanceEngine"
  );

  handlerContent = handlerContent.replace(
    "await this.analytics.ingestFieldEvent(event);",
    `await this.analytics.ingestFieldEvent(event);
    await this.performanceEngine.evaluate(event);`
  );

  fs.writeFileSync(handlerPath, handlerContent, "utf8");
  console.log("Patched:", handlerPath);
}

console.log("Performance Engine installed and integrated.");
