// src/api/agent/agent.routes.ts
// LooseArrows Divisions Engine — Agent Chat Endpoint
// Public (no API key required)
//
// POST /api/agent/chat
//   Body:    { "message": string }
//   Returns: { "reply": string }

import { Router, Request, Response } from "express";

const agentRouter = Router();

agentRouter.post("/chat", async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body as { message?: unknown };

    if (typeof message !== "string" || message.trim() === "") {
      res.status(400).json({
        error: "message is required and must be a non-empty string.",
      });
      return;
    }

    res.json({ reply: `Agent received: ${message}` });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    res.status(500).json({ error: msg });
  }
});

export default agentRouter;
