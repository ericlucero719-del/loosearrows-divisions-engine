// src/services/RapidResponseOperatorService.ts

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
