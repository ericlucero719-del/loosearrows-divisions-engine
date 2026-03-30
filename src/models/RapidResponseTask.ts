// src/models/RapidResponseTask.ts

export interface RapidResponseTask {
  id: string;
  taskType: string;
  contractPriority?: number;
  vendorRisk?: number;
  operationalUrgency?: number;
  location: { lat: number; lng: number };
  description?: string;
  createdAt: number;
  assignedOperatorId?: string;
}
