"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// modules/amazon/amazon.routes.ts
// LooseArrows Supply & Logistics™ — Amazon Sales Automation
const commerce_routes_1 = require("../commerce/commerce.routes");
exports.default = (0, commerce_routes_1.makeCommerceRouter)({
    platform: "AMAZON",
    prefix: "AMZ",
    label: "Amazon Commerce",
});
//# sourceMappingURL=amazon.routes.js.map