"use strict";
// src/infrastructure/contractDataLoader.ts
// Loads contract reference data for engine consumption.
// Reads from a JSON snapshot file if present; falls back to the live registry.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadContractData = loadContractData;
const fs_1 = __importDefault(require("fs"));
const engine_1 = require("../core/engine");
async function loadContractData({ logger, sourcePath, }) {
    // Prefer a pre-built JSON snapshot alongside the PDF path
    const jsonPath = sourcePath.replace(/\.(pdf|PDF)$/, ".json");
    if (fs_1.default.existsSync(jsonPath)) {
        try {
            const raw = fs_1.default.readFileSync(jsonPath, "utf8");
            const data = JSON.parse(raw);
            logger.info("Contract data loaded from snapshot", { path: jsonPath });
            return data;
        }
        catch (err) {
            logger.warn("Failed to parse contract snapshot, falling back to registry", {
                error: err.message,
            });
        }
    }
    // Fall back to the live in-memory registry
    const contracts = engine_1.registry.contracts;
    const naicsCodes = Array.from(new Set(Object.values(engine_1.registry.products)
        .map((p) => p.naics)
        .filter(Boolean)));
    const clins = Array.from(new Set(Object.values(engine_1.registry.products)
        .map((p) => p.clin)
        .filter(Boolean)));
    logger.info("Contract data loaded from live registry", {
        contracts: Object.keys(contracts).length,
        naics: naicsCodes.length,
        clins: clins.length,
    });
    return { contracts, naicsCodes, clins };
}
//# sourceMappingURL=contractDataLoader.js.map