// modules/tiktokAutomation.ts
// LooseArrows Supply & Logistics™
// TikTok Sales Automation — named module entry point
//
// Mounted at /api in server.ts so external integrations can import and use it:
//   import tiktokAutomation from "./modules/tiktokAutomation.js";
//   app.use("/api", tiktokAutomation);
//
// All routes require Operator-tier X-API-Key header.
//
// POST   /api/tiktok/order              capture → SKU match → profit → PO
// POST   /api/tiktok/fulfill            home (label + tracking) | supplier
// POST   /api/tiktok/invoice            generate Division 9 invoice
// POST   /api/tiktok/payment            mark invoice PAID
// POST   /api/tiktok/notify             log event + sync Division 1 inventory
// GET    /api/tiktok/orders             list all orders (?status= filter)
// GET    /api/tiktok/orders/:order_id   full order detail
// GET    /api/tiktok/summary            revenue / profit / status breakdown

import { Router } from "express";
import tikTokRouter from "./tiktok/tiktok.routes";

const tiktokAutomation = Router();

tiktokAutomation.use("/tiktok", tikTokRouter);

export default tiktokAutomation;
