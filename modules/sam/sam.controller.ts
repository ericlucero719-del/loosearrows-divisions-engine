// modules/sam/sam.controller.ts
import { Request, Response } from "express";
import { samService } from "./sam.service";

export const samController = {

  async search(req: Request, res: Response) {
    try {
      const { keyword, naics, limit, offset } = req.query as Record<string, string>;
      return res.json(await samService.search({
        keyword, naics,
        limit:  limit  ? parseInt(limit)  : undefined,
        offset: offset ? parseInt(offset) : undefined,
      }));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async matchToAgencies(_req: Request, res: Response) {
    try { return res.json(await samService.matchToAgencies()); }
    catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async addToWatchlist(req: Request, res: Response) {
    try {
      const { noticeId, status, notes, ...rest } = req.body;
      if (!noticeId) return res.status(400).json({ error: "noticeId is required" });
      // `rest` may contain title, naicsCode, awardAmount, etc. supplied manually
      return res.status(201).json(await samService.addToWatchlist(noticeId, status, notes, rest));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async listWatchlist(req: Request, res: Response) {
    try { return res.json(await samService.listWatchlist(req.query.status as string)); }
    catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { status, notes } = req.body;
      if (!status) return res.status(400).json({ error: "status is required" });
      return res.json(await samService.updateStatus(req.params.noticeId, status, notes));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async removeFromWatchlist(req: Request, res: Response) {
    try {
      await samService.removeFromWatchlist(req.params.noticeId);
      return res.json({ status: "Removed from watchlist", noticeId: req.params.noticeId });
    } catch (e: any) { return res.status(404).json({ error: e.message }); }
  },

  async watchlistSummary(_req: Request, res: Response) {
    try { return res.json(await samService.watchlistSummary()); }
    catch (e: any) { return res.status(500).json({ error: e.message }); }
  },
};
