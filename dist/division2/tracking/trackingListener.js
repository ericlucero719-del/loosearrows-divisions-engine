"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingListener = void 0;
class TrackingListener {
    constructor() {
        this.history = {};
    }
    normalize(update) {
        const now = new Date().toISOString();
        const normalized = {
            orderId: update.orderId,
            carrier: update.carrier,
            trackingNumber: update.trackingNumber,
            status: update.status,
            eta: update.eta,
            lastScan: update.lastScan,
            location: update.location,
            updatedAt: now,
        };
        this.history[update.orderId] = normalized;
        return normalized;
    }
    getLatest(orderId) {
        return this.history[orderId];
    }
}
exports.TrackingListener = TrackingListener;
//# sourceMappingURL=trackingListener.js.map