// modules/instagram/instagram.routes.ts
// LooseArrows Supply & Logistics™ — Instagram Sales Automation
import { makeCommerceRouter } from "../commerce/commerce.routes";

export default makeCommerceRouter({
  platform: "INSTAGRAM",
  prefix:   "IG",
  label:    "Instagram Commerce",
});
