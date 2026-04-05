// src/infrastructure/contractDataLoader.ts
// Loads contract reference data for engine consumption.
// Reads from a JSON snapshot file if present; falls back to the live registry.

import fs from "fs";
import path from "path";
import { Logger } from "./logger";
import { registry } from "../core/engine";

export interface ContractData {
  contracts: Record<string, any>;
  naicsCodes: string[];
  clins: string[];
}

export async function loadContractData({
  logger,
  sourcePath,
}: {
  logger: Logger;
  sourcePath: string;
}): Promise<ContractData> {
  // Prefer a pre-built JSON snapshot alongside the PDF path
  const jsonPath = sourcePath.replace(/\.(pdf|PDF)$/, ".json");

  if (fs.existsSync(jsonPath)) {
    try {
      const raw = fs.readFileSync(jsonPath, "utf8");
      const data = JSON.parse(raw) as ContractData;
      logger.info("Contract data loaded from snapshot", { path: jsonPath });
      return data;
    } catch (err: any) {
      logger.warn("Failed to parse contract snapshot, falling back to registry", {
        error: err.message,
      });
    }
  }

  // Fall back to the live in-memory registry
  const contracts = registry.contracts;
  const naicsCodes = Array.from(
    new Set(
      Object.values(registry.products)
        .map((p: any) => p.naics)
        .filter(Boolean)
    )
  ) as string[];

  const clins = Array.from(
    new Set(
      Object.values(registry.products)
        .map((p: any) => p.clin)
        .filter(Boolean)
    )
  ) as string[];

  logger.info("Contract data loaded from live registry", {
    contracts: Object.keys(contracts).length,
    naics: naicsCodes.length,
    clins: clins.length,
  });

  return { contracts, naicsCodes, clins };
}
