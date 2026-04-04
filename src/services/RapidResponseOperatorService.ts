// src/services/RapidResponseOperatorService.ts

import fs from "fs";
import path from "path";
import { RapidResponseOperator } from "../models/RapidResponseOperator";

const DATA_PATH = path.join(process.cwd(), "src", "data", "operators.json");

export class RapidResponseOperatorService {
  private filePath = DATA_PATH;

  constructor() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
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
