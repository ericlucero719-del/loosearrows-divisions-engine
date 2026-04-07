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

import { Router } from "express";
import { operatorWorkflow } from "../../src/core/engine";
import { samController } from "./sam.controller";

const router = Router();

router.get("/search",                     operatorWorkflow("SAM", "SEARCH"),           samController.search);
router.get("/match",                      operatorWorkflow("SAM", "MATCH_AGENCIES"),   samController.matchToAgencies);
router.get("/watchlist/summary",          operatorWorkflow("SAM", "WATCHLIST_SUMMARY"), samController.watchlistSummary);
router.get("/watchlist",                  operatorWorkflow("SAM", "LIST_WATCHLIST"),   samController.listWatchlist);
router.post("/watchlist",                 operatorWorkflow("SAM", "ADD_WATCHLIST"),    samController.addToWatchlist);
router.patch("/watchlist/:noticeId",      operatorWorkflow("SAM", "UPDATE_STATUS"),    samController.updateStatus);
router.delete("/watchlist/:noticeId",     operatorWorkflow("SAM", "REMOVE_WATCHLIST"), samController.removeFromWatchlist);

export default router;
