// modules/division8/division8.service.ts
// Division 8 — Agency / Customer Management

import { randomUUID } from "crypto";
import { registry } from "../../src/core/engine";
import { Agency, AgencyContact } from "./division8.types";

export class Division8Service {
  createAgency(data: {
    name: string;
    contacts?: AgencyContact[];
    preferences?: Record<string, any>;
  }): Agency {
    const now = new Date().toISOString();
    const agency: Agency = {
      id: randomUUID(),
      name: data.name,
      contacts: data.contacts ?? [],
      preferences: data.preferences ?? {},
      linkedContracts: [],
      linkedRequests: [],
      createdAt: now,
      updatedAt: now,
    };
    registry.agencies[agency.id] = agency;
    return agency;
  }

  listAgencies(): Agency[] {
    return Object.values(registry.agencies) as Agency[];
  }

  getAgency(id: string): Agency | null {
    return (registry.agencies[id] as Agency) ?? null;
  }

  updateAgency(id: string, updates: Partial<Agency>): Agency | null {
    const agency = registry.agencies[id] as Agency;
    if (!agency) return null;
    Object.assign(agency, { ...updates, updatedAt: new Date().toISOString() });
    return agency;
  }

  linkContract(id: string, contractId: string): Agency | null {
    const agency = registry.agencies[id] as Agency;
    if (!agency) return null;
    if (!agency.linkedContracts.includes(contractId)) {
      agency.linkedContracts.push(contractId);
    }
    agency.updatedAt = new Date().toISOString();
    return agency;
  }

  linkRequest(id: string, requestId: string): Agency | null {
    const agency = registry.agencies[id] as Agency;
    if (!agency) return null;
    if (!agency.linkedRequests.includes(requestId)) {
      agency.linkedRequests.push(requestId);
    }
    agency.updatedAt = new Date().toISOString();
    return agency;
  }
}

export const division8Service = new Division8Service();
