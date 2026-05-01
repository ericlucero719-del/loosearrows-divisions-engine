// src/api/agent/agent.routes.ts
// LooseArrows Supply & Logistics™
// Agent Chat Router — public endpoint, no API key required
//
// POST /api/agent/chat
//   Body:    { "message": string }
//   Returns: { "reply": string }

import { Router, Request, Response } from "express";

const agentRouter = Router();

agentRouter.post("/chat", async (req: Request, res: Response) => {
  const { message } = req.body ?? {};

  if (!message || typeof message !== "string" || message.trim() === "") {
    return res.status(400).json({
      error: "Missing or invalid 'message' field.",
      hint:  "Send a JSON body with a non-empty 'message' string.",
    });
  }

  return res.json({
    reply: `Agent received: ${message.trim()}`,
  });
});

export default agentRouter;
