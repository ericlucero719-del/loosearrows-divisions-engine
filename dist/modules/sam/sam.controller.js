"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.samController = void 0;
const sam_service_1 = require("./sam.service");
exports.samController = {
    async search(req, res) {
        try {
            const { keyword, naics, limit, offset } = req.query;
            return res.json(await sam_service_1.samService.search({
                keyword, naics,
                limit: limit ? parseInt(limit) : undefined,
                offset: offset ? parseInt(offset) : undefined,
            }));
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async matchToAgencies(_req, res) {
        try {
            return res.json(await sam_service_1.samService.matchToAgencies());
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async addToWatchlist(req, res) {
        try {
            const { noticeId, status, notes, ...rest } = req.body;
            if (!noticeId)
                return res.status(400).json({ error: "noticeId is required" });
            // `rest` may contain title, naicsCode, awardAmount, etc. supplied manually
            return res.status(201).json(await sam_service_1.samService.addToWatchlist(noticeId, status, notes, rest));
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async listWatchlist(req, res) {
        try {
            return res.json(await sam_service_1.samService.listWatchlist(req.query.status));
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
    async updateStatus(req, res) {
        try {
            const { status, notes } = req.body;
            if (!status)
                return res.status(400).json({ error: "status is required" });
            return res.json(await sam_service_1.samService.updateStatus(req.params.noticeId, status, notes));
        }
        catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    async removeFromWatchlist(req, res) {
        try {
            await sam_service_1.samService.removeFromWatchlist(req.params.noticeId);
            return res.json({ status: "Removed from watchlist", noticeId: req.params.noticeId });
        }
        catch (e) {
            return res.status(404).json({ error: e.message });
        }
    },
    async watchlistSummary(_req, res) {
        try {
            return res.json(await sam_service_1.samService.watchlistSummary());
        }
        catch (e) {
            return res.status(500).json({ error: e.message });
        }
    },
};
//# sourceMappingURL=sam.controller.js.map