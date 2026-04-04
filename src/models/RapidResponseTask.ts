// src/models/RapidResponseTask.ts

import { RapidResponseTaskType } from "./RapidResponseEvent";

export interface RapidResponseTask {
  id: string;
  taskType: RapidResponseTaskType;
  contractPriority?: number;
  vendorRisk?: number;
  operationalUrgency?: number;
  location: { lat: number; lng: number };
  description?: string;
  createdAt: number;
  assignedOperatorId?: string;
}
