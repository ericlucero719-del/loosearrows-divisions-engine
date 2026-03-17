import { SupplierMatchInput, SupplierMatchResult, SupplierMatchFailure, SupplierInput, PriorityRule } from "../types";

const WEIGHTS = {
  cost: 0.4,
  speed: 0.25,
  stock: 0.15,
  distance: 0.1,
  reliability: 0.1,
} as const;

function normalize(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  if (range === 0) {
    return values.map(() => 1);
  }
  return values.map((v) => (v - min) / range);
}

function getPriorityBoost(supplierId: string, priorityRules?: PriorityRule[]) {
  if (!priorityRules?.length) return 0;
  const rule = priorityRules.find((r) => r.supplierId === supplierId);
  if (!rule) return 0;
  // Lower priority number = higher priority. Convert to a small boost.
  // Cap at 10% bonus.
  const normalized = Math.max(0, 1 - rule.priority / 10);
  return Math.min(0.1, normalized * 0.1);
}

export type SupplierAttemptFn<T> = (supplier: SupplierInput) => Promise<T>;

export async function matchSupplier<T>(
  input: SupplierMatchInput,
  attempt: SupplierAttemptFn<T>,
  options?: { maxRetries?: number }
): Promise<{ result?: SupplierMatchResult; failure?: SupplierMatchFailure; attemptResult?: T }> {
  const maxRetries = options?.maxRetries ?? 3;
  const suppliers = input.suppliers;

  if (!suppliers?.length) {
    return {
      failure: {
        reason: "manual-review",
        message: "No suppliers provided",
        attemptedSupplierIds: [],
      },
    };
  }

  const costs = suppliers.map((s) => s.cost);
  const speeds = suppliers.map((s) => s.shippingSpeedDays);
  const distances = suppliers.map((s) => s.distanceKm ?? 0);

  const normCost = normalize(costs).map((v) => 1 - v); // lower cost should be higher score
  const normSpeed = normalize(speeds).map((v) => 1 - v); // faster = lower days
  const normDistance = normalize(distances).map((v) => 1 - v);

  const scored = suppliers.map((supplier, index) => {
    const stockScore = supplier.stock >= input.quantity ? 1 : 0;
    const reliabilityScore = Math.min(Math.max(supplier.reliabilityScore, 0), 1);

    const baseScore =
      normCost[index] * WEIGHTS.cost +
      normSpeed[index] * WEIGHTS.speed +
      stockScore * WEIGHTS.stock +
      (supplier.distanceKm !== undefined ? normDistance[index] * WEIGHTS.distance : 0) +
      reliabilityScore * WEIGHTS.reliability;

    const priorityBoost = getPriorityBoost(supplier.id, input.priorityRules);
    const score = baseScore + priorityBoost;

    return {
      supplier,
      score,
      rationale: {
        costScore: normCost[index],
        speedScore: normSpeed[index],
        stockScore,
        distanceScore: supplier.distanceKm !== undefined ? normDistance[index] : 0,
        reliabilityScore,
      },
    };
  });

  // Sort descending
  const ranked = scored.sort((a, b) => b.score - a.score);

  const hasStock = ranked.some((item) => item.rationale.stockScore > 0);
  if (!hasStock) {
    return {
      failure: {
        reason: "no-stock",
        message: "No supplier has enough stock to fulfill the requested quantity",
        attemptedSupplierIds: ranked.map((r) => r.supplier.id),
      },
    };
  }

  const triedSupplierIds: string[] = [];
  let lastError: unknown = null;

  for (const entry of ranked) {
    const supplier = entry.supplier;
    if (entry.rationale.stockScore === 0) continue; // skip out-of-stock

    triedSupplierIds.push(supplier.id);

    // Attempt with retry
    let attemptResult: T | undefined;
    let attemptSuccess = false;

    for (let attemptCount = 1; attemptCount <= maxRetries; attemptCount++) {
      try {
        attemptResult = await attempt(supplier);
        attemptSuccess = true;
        break;
      } catch (error) {
        lastError = error;
        if (attemptCount >= maxRetries) {
          // will fall back to next supplier
          break;
        }
      }
    }

    if (attemptSuccess && attemptResult !== undefined) {
      const preferredContact: "email" | "api" | "portal" =
        supplier.apiEndpoint ? "api" : supplier.portalUrl ? "portal" : "email";

      const result: SupplierMatchResult = {
        supplierId: supplier.id,
        supplierName: supplier.name,
        supplierSku: supplier.sku,
        supplierCost: supplier.cost,
        supplierShippingMethod: "standard",
        supplierLeadTimeDays: supplier.leadTimeDays,
        supplierContactMethod: preferredContact,
        score: entry.score,
        rationale: entry.rationale,
      };

      return { result, attemptResult };
    }
  }

  return {
    failure: {
      reason: "api-failure",
      message:
        "All selected suppliers failed after retrying. Manual review required.",
      attemptedSupplierIds: triedSupplierIds,
    },
  };
}
