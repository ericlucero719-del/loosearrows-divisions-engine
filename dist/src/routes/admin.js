"use strict";
// src/routes/admin.ts
// Admin Key Management — protected by X-Admin-Secret header
// ─────────────────────────────────────────────────────────────────────────────
// All routes require: X-Admin-Secret: <your ADMIN_SECRET env var>
//
// GET    /admin/keys           — list all API keys
// POST   /admin/keys           — issue a new key
//   Body: { "tier": "OBSERVER"|"OPERATOR"|"ARCHITECT", "ownerName": "...", "ownerEmail": "...", "notes": "..." }
// PATCH  /admin/keys/:id/toggle — activate or deactivate a key
// DELETE /admin/keys/:id       — permanently delete a key
// GET    /admin/keys/audit     — keys with lastUsedAt (activity report)
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// ── Admin secret gate ─────────────────────────────────────────────────────────
function requireAdminSecret(req, res, next) {
    const provided = req.headers["x-admin-secret"];
    const expected = process.env.ADMIN_SECRET;
    if (!expected) {
        return res.status(500).json({ error: "ADMIN_SECRET env var not configured on this server." });
    }
    if (!provided || provided !== expected) {
        return res.status(401).json({ error: "Admin access denied. Check X-Admin-Secret header." });
    }
    next();
}
router.use(requireAdminSecret);
// ── Key generation ────────────────────────────────────────────────────────────
function generateKey(tier) {
    const prefix = tier === "OBSERVER" ? "la-obs" : tier === "OPERATOR" ? "la-opr" : "la-arc";
    return `${prefix}-${(0, crypto_1.randomBytes)(18).toString("hex")}`;
}
// GET /admin/keys — list all keys (values masked after prefix)
router.get("/keys", async (_req, res) => {
    const keys = await prisma.apiKey.findMany({ orderBy: { createdAt: "desc" } });
    return res.json(keys.map(k => ({
        ...k,
        key: `${k.key.slice(0, 10)}...${k.key.slice(-6)}`, // mask middle of key
    })));
});
// GET /admin/keys/audit — who used their key and when
router.get("/keys/audit", async (_req, res) => {
    const keys = await prisma.apiKey.findMany({
        orderBy: { lastUsedAt: { sort: "desc", nulls: "last" } },
    });
    return res.json(keys.map(k => ({
        id: k.id,
        ownerName: k.ownerName,
        ownerEmail: k.ownerEmail,
        tier: k.tier,
        active: k.active,
        lastUsedAt: k.lastUsedAt,
        createdAt: k.createdAt,
    })));
});
// GET /admin/keys/:id — get a single key record (key value fully shown once for copy)
router.get("/keys/:id", async (req, res) => {
    const record = await prisma.apiKey.findUnique({ where: { id: req.params.id } });
    if (!record)
        return res.status(404).json({ error: "Key not found" });
    return res.json(record);
});
// POST /admin/keys — issue a new key
router.post("/keys", async (req, res) => {
    const { tier, ownerName, ownerEmail, notes } = req.body;
    if (!["OBSERVER", "OPERATOR", "ARCHITECT"].includes(tier)) {
        return res.status(400).json({
            error: "tier must be OBSERVER, OPERATOR, or ARCHITECT",
        });
    }
    if (!ownerName?.trim()) {
        return res.status(400).json({ error: "ownerName is required" });
    }
    const key = generateKey(tier);
    const record = await prisma.apiKey.create({
        data: {
            key,
            tier,
            ownerName: ownerName.trim(),
            ownerEmail: ownerEmail?.trim() ?? null,
            notes: notes?.trim() ?? null,
        },
    });
    // Return full key value ONCE — tell caller to save it
    return res.status(201).json({
        ...record,
        _notice: "Save this key now — it will not be shown in full again via the list endpoint.",
    });
});
// PATCH /admin/keys/:id/toggle — flip active status
router.patch("/keys/:id/toggle", async (req, res) => {
    const existing = await prisma.apiKey.findUnique({ where: { id: req.params.id } });
    if (!existing)
        return res.status(404).json({ error: "Key not found" });
    const updated = await prisma.apiKey.update({
        where: { id: req.params.id },
        data: { active: !existing.active },
    });
    return res.json({
        id: updated.id,
        ownerName: updated.ownerName,
        tier: updated.tier,
        active: updated.active,
        message: updated.active ? "Key reactivated." : "Key deactivated — access revoked immediately.",
    });
});
// DELETE /admin/keys/:id — permanently remove
router.delete("/keys/:id", async (req, res) => {
    const existing = await prisma.apiKey.findUnique({ where: { id: req.params.id } });
    if (!existing)
        return res.status(404).json({ error: "Key not found" });
    await prisma.apiKey.delete({ where: { id: req.params.id } });
    return res.json({ deleted: true, ownerName: existing.ownerName, tier: existing.tier });
});
exports.default = router;
//# sourceMappingURL=admin.js.map