// src/api/agent/agent.routes.ts
// LooseArrows Supply & Logistics™
// Agent Chat — POST /api/agent/chat
//
// Public endpoint (no API key required).
// Accepts { "message": string } and returns { "reply": string }.

import { Router, Request, Response } from "express";

const agentRouter = Router();

agentRouter.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "message must be a non-empty string" });
    }

    return res.json({ reply: `Agent received: ${message.trim()}` });
  } catch (e: any) {
    return res.status(500).json({ error: e.message ?? "Internal server error" });
  }
});

export default agentRouter;
