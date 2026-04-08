"use strict";
// modules/tiktokAutomation.ts
// LooseArrows Supply & Logistics™
// TikTok Sales Automation — named module entry point
//
// Canonical path: /api/tiktok/* (via src/api/index.ts)
//
// This file is kept for external import compatibility:
//   import tiktokAutomation from "./modules/tiktokAutomation.js";
//   app.use("/api", tiktokAutomation);   // → /api/tiktok/*
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tiktok_routes_1 = __importDefault(require("./tiktok/tiktok.routes"));
const tiktokAutomation = (0, express_1.Router)();
tiktokAutomation.use("/tiktok", tiktok_routes_1.default);
exports.default = tiktokAutomation;
//# sourceMappingURL=tiktokAutomation.js.map