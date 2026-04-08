"use strict";
// modules/sam/sam.routes.ts
// LooseArrows Supply & Logistics™ — SAM.gov Integration
//
// GET    /api/sam/search                 search live federal opportunities (?keyword=&naics=&limit=)
// GET    /api/sam/match                  auto-match against your Division 8 NAICS codes
// GET    /api/sam/watchlist              list saved opportunities (?status=)
// GET    /api/sam/watchlist/summary      totals, award values, status breakdown
// POST   /api/sam/watchlist              add opportunity to watchlist  { noticeId, status?, notes? }
// PATCH  /api/sam/watchlist/:noticeId    update status/notes
// DELETE /api/sam/watchlist/:noticeId    remove from watchlist
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const engine_1 = require("../../src/core/engine");
const sam_controller_1 = require("./sam.controller");
const router = (0, express_1.Router)();
router.get("/search", (0, engine_1.operatorWorkflow)("SAM", "SEARCH"), sam_controller_1.samController.search);
router.get("/match", (0, engine_1.operatorWorkflow)("SAM", "MATCH_AGENCIES"), sam_controller_1.samController.matchToAgencies);
router.get("/watchlist/summary", (0, engine_1.operatorWorkflow)("SAM", "WATCHLIST_SUMMARY"), sam_controller_1.samController.watchlistSummary);
router.get("/watchlist", (0, engine_1.operatorWorkflow)("SAM", "LIST_WATCHLIST"), sam_controller_1.samController.listWatchlist);
router.post("/watchlist", (0, engine_1.operatorWorkflow)("SAM", "ADD_WATCHLIST"), sam_controller_1.samController.addToWatchlist);
router.patch("/watchlist/:noticeId", (0, engine_1.operatorWorkflow)("SAM", "UPDATE_STATUS"), sam_controller_1.samController.updateStatus);
router.delete("/watchlist/:noticeId", (0, engine_1.operatorWorkflow)("SAM", "REMOVE_WATCHLIST"), sam_controller_1.samController.removeFromWatchlist);
exports.default = router;
//# sourceMappingURL=sam.routes.js.map