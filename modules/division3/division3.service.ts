// modules/division3/division3.service.ts
// Division 3 — Requests & Work Orders

import { randomUUID } from "crypto";
import { registry } from "../../src/core/engine";
import { WorkRequest, RequestType, RequestStatus } from "./division3.types";

export class Division3Service {
  createRequest(data: {
    type: RequestType;
    requestorId: string;
    notes?: string;
  }): WorkRequest {
    const now = new Date().toISOString();
    const req: WorkRequest = {
      id: randomUUID(),
      type: data.type,
      requestorId: data.requestorId,
      productIds: [],
      status: "New",
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };
    registry.requests[req.id] = req;
    return req;
  }

  attachProducts(id: string, productIds: string[]): WorkRequest | null {
    const req = registry.requests[id] as WorkRequest;
    if (!req) return null;
    const unique = new Set([...req.productIds, ...productIds]);
    req.productIds = Array.from(unique);
    req.updatedAt = new Date().toISOString();
    return req;
  }

  linkContract(id: string, contractId: string): WorkRequest | null {
    const req = registry.requests[id] as WorkRequest;
    if (!req) return null;
    req.contractId = contractId;
    req.updatedAt = new Date().toISOString();
    return req;
  }

  updateStatus(id: string, status: RequestStatus): WorkRequest | null {
    const req = registry.requests[id] as WorkRequest;
    if (!req) return null;
    req.status = status;
    req.updatedAt = new Date().toISOString();
    return req;
  }

  listRequests(): WorkRequest[] {
    return Object.values(registry.requests) as WorkRequest[];
  }

  getRequest(id: string): WorkRequest | null {
    const req = registry.requests[id] as WorkRequest;
    if (!req) return null;
    return {
      ...req,
      _products: req.productIds.map((sku: string) => registry.products[sku] ?? { sku }),
      _contract: req.contractId ? registry.contracts[req.contractId] : null,
    } as any;
  }
}

export const division3Service = new Division3Service();
