"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperatorDashboard = void 0;
class OperatorDashboard {
    getOrdersView() {
        return {
            columns: ["Order ID", "Store", "Status", "Created At"],
            filters: ["status", "storeId"],
            actions: ["view", "cancel", "refund"],
        };
    }
    getPoView() {
        return {
            columns: ["PO #", "Supplier", "Order", "Status", "Created At"],
            filters: ["status", "supplierId"],
            actions: ["view", "resend", "cancel"],
        };
    }
    getTrackingView() {
        return {
            columns: ["Order", "Carrier", "Tracking #", "Status", "ETA"],
            filters: ["status", "carrier"],
            actions: ["refresh", "notifyCustomer"],
        };
    }
    getPerformanceView() {
        return {
            metrics: ["supplierReliability", "onTimeRate", "orderCycleTime"],
            charts: ["supplierScoreTrend", "ordersByStatus"],
        };
    }
    getErrorView() {
        return {
            columns: ["Timestamp", "Context", "Error", "Status"],
            filters: ["severity", "source"],
        };
    }
    getAutomationLogView() {
        return {
            columns: ["Timestamp", "Flow", "Event", "Status"],
            filters: ["flow", "status"],
        };
    }
}
exports.OperatorDashboard = OperatorDashboard;
//# sourceMappingURL=operatorDashboard.js.map