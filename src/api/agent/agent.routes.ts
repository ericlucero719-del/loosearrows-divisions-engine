// src/api/agent/agent.routes.ts
// LooseArrows Supply & Logistics™
// Agent Chat Interface — public endpoint (no API key required)
//
// POST /api/agent/chat  — send a message to the agent, receive a reply

import { Router, Request, Response } from "express";

const agentRouter = Router();

agentRouter.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      res.status(400).json({ error: "message must be a non-empty string" });
      return;
    }

    res.json({ reply: `Agent received: ${message.trim()}` });
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? "Internal server error" });
  }
});

export default agentRouter;
