// src/models/RapidResponseEvent.ts

export interface RapidResponseEvent {
  id: string;
  operatorId: string;
  division: "FIELD_RAPID_RESPONSE";
  taskType: RapidResponseTaskType;
  relatedContractId?: string;
  relatedVendorId?: string;
  relatedLogisticsId?: string;
  location: GeoPoint;
  timestamp: number;
  forgeMark: ForgeMarkStamp;
  payload: Record<string, any>;
}

export type RapidResponseTaskType =
  | "ON_SITE_VERIFICATION"
  | "EMERGENCY_CHECK"
  | "CONTRACT_CRITICAL_INSPECTION"
  | "VENDOR_CAPABILITY_CHECK"
  | "DELIVERY_CONFIRMATION"
  | "ISSUE_RESOLUTION"
  | "FIELD_DATA_CAPTURE";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ForgeMarkStamp {
  operatorId: string;
  issuedAt: number;
  signature: string;
}
