// modules/division8/division8.types.ts
// Division 8 — Agency / Customer Management

export interface AgencyContact {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface Agency {
  id: string;
  name: string;
  contacts: AgencyContact[];
  preferences?: Record<string, any>;
  linkedContracts: string[];
  linkedRequests: string[];
  createdAt: string;
  updatedAt: string;
}
