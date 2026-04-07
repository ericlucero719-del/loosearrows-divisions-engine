// modules/youtube/youtube.routes.ts
// LooseArrows Supply & Logistics™ — YouTube Sales Automation
import { makeCommerceRouter } from "../commerce/commerce.routes";

export default makeCommerceRouter({
  platform: "YOUTUBE",
  prefix:   "YT",
  label:    "YouTube Commerce",
});
