export type RapidResponseTaskType =
  | "PROCUREMENT"
  | "FULFILLMENT"
  | "DISPATCH"
  | "TRACKING"
  | "COMPLIANCE_REVIEW"
  | "BID_ANALYSIS"
  | "SUPPLIER_ESCALATION"
  | "EMERGENCY_REORDER";

export interface RapidResponseEvent {
  id: string;
  taskType: RapidResponseTaskType;
  triggeredAt: string;
  contractId?: string;
  orderId?: string;
  supplierId?: string;
  priority: number;
  metadata?: Record<string, unknown>;
}
