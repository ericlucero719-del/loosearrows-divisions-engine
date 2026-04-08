"use strict";
// src/services/RapidResponseOperatorService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RapidResponseOperatorService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_PATH = path_1.default.join(process.cwd(), "src", "data", "operators.json");
class RapidResponseOperatorService {
    constructor() {
        this.filePath = DATA_PATH;
        const dir = path_1.default.dirname(this.filePath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        if (!fs_1.default.existsSync(this.filePath)) {
            fs_1.default.writeFileSync(this.filePath, JSON.stringify([]));
        }
    }
    load() {
        return JSON.parse(fs_1.default.readFileSync(this.filePath, "utf8"));
    }
    save(operators) {
        fs_1.default.writeFileSync(this.filePath, JSON.stringify(operators, null, 2));
    }
    getAll() {
        return this.load();
    }
    add(operator) {
        const operators = this.load();
        operators.push(operator);
        this.save(operators);
        return operator;
    }
    update(id, updates) {
        const operators = this.load();
        const index = operators.findIndex(op => op.id === id);
        if (index === -1)
            return null;
        operators[index] = { ...operators[index], ...updates };
        this.save(operators);
        return operators[index];
    }
}
exports.RapidResponseOperatorService = RapidResponseOperatorService;
//# sourceMappingURL=RapidResponseOperatorService.js.map