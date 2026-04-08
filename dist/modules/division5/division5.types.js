"use strict";
// modules/division5/division5.types.ts
// Division 5 — Logistics & Fulfillment
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_ALIASES = void 0;
exports.normalizeStatus = normalizeStatus;
// Accept camelCase or spaced variants from callers
exports.STATUS_ALIASES = {
    outfordelivery: "Out for Delivery",
    "out for delivery": "Out for Delivery",
    intransit: "In Transit",
    "in transit": "In Transit",
    pending: "Pending",
    picked: "Picked",
    delivered: "Delivered",
    returned: "Returned",
    cancelled: "Cancelled",
};
function normalizeStatus(raw) {
    return exports.STATUS_ALIASES[raw.toLowerCase()] ?? null;
}
//# sourceMappingURL=division5.types.js.map