// modules/division8/division8.controller.ts
// Division 8 — Agency & Customer Management

import { Request, Response } from "express";
import { division8Service } from "./division8.service";

export const division8Controller = {

  async listAgencies(req: Request, res: Response) {
    try {
      const { status } = req.query as Record<string, string | undefined>;
      return res.json(await division8Service.listAgencies(status));
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async getAgency(req: Request, res: Response) {
    try {
      const a = await division8Service.getAgency(req.params.agencyId);
      if (!a) return res.status(404).json({ error: "Agency not found" });
      return res.json(a);
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async createAgency(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: "name is required" });
      return res.status(201).json(await division8Service.createAgency(req.body));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async updateAgency(req: Request, res: Response) {
    try {
      return res.json(await division8Service.updateAgency(req.params.agencyId, req.body));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async addContact(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: "name is required" });
      return res.status(201).json(await division8Service.addContact(req.params.agencyId, req.body));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async deleteContact(req: Request, res: Response) {
    try {
      await division8Service.deleteContact(req.params.contactId);
      return res.json({ deleted: req.params.contactId });
    } catch (e: any) { return res.status(404).json({ error: e.message }); }
  },

  async addInteraction(req: Request, res: Response) {
    try {
      const { type, summary } = req.body;
      if (!type || !summary) return res.status(400).json({ error: "type and summary are required" });
      return res.status(201).json(await division8Service.addInteraction(req.params.agencyId, req.body));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async agencySummary(_req: Request, res: Response) {
    try {
      return res.json(await division8Service.agencySummary());
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  meta(_req: Request, res: Response) {
    return res.json({
      contactRoles:     division8Service.contactRoles(),
      interactionTypes: division8Service.interactionTypes(),
    });
  },
};
