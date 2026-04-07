// modules/tiktokAutomation.ts
// LooseArrows Supply & Logistics™
// TikTok Sales Automation — named module entry point
//
// Canonical path: /api/tiktok/* (via src/api/index.ts)
//
// This file is kept for external import compatibility:
//   import tiktokAutomation from "./modules/tiktokAutomation.js";
//   app.use("/api", tiktokAutomation);   // → /api/tiktok/*

import { Router } from "express";
import tikTokRouter from "./tiktok/tiktok.routes";

const tiktokAutomation = Router();
tiktokAutomation.use("/tiktok", tikTokRouter);

export default tiktokAutomation;
