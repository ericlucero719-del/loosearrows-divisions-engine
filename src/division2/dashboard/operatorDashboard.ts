import { PurchaseOrderRequest } from "../types";

export class OperatorDashboard {
  public getOrdersView() {
    return {
      columns: ["Order ID", "Store", "Status", "Created At"],
      filters: ["status", "storeId"],
      actions: ["view", "cancel", "refund"],
    };
  }

  public getPoView() {
    return {
      columns: ["PO #", "Supplier", "Order", "Status", "Created At"],
      filters: ["status", "supplierId"],
      actions: ["view", "resend", "cancel"],
    };
  }

  public getTrackingView() {
    return {
      columns: ["Order", "Carrier", "Tracking #", "Status", "ETA"],
      filters: ["status", "carrier"],
      actions: ["refresh", "notifyCustomer"],
    };
  }

  public getPerformanceView() {
    return {
      metrics: ["supplierReliability", "onTimeRate", "orderCycleTime"],
      charts: ["supplierScoreTrend", "ordersByStatus"],
    };
  }

  public getErrorView() {
    return {
      columns: ["Timestamp", "Context", "Error", "Status"],
      filters: ["severity", "source"],
    };
  }

  public getAutomationLogView() {
    return {
      columns: ["Timestamp", "Flow", "Event", "Status"],
      filters: ["flow", "status"],
    };
  }
}
