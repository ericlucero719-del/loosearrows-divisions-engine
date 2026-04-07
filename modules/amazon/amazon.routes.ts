// modules/amazon/amazon.routes.ts
// LooseArrows Supply & Logistics™ — Amazon Sales Automation
import { makeCommerceRouter } from "../commerce/commerce.routes";

export default makeCommerceRouter({
  platform: "AMAZON",
  prefix:   "AMZ",
  label:    "Amazon Commerce",
});
