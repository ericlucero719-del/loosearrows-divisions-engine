// modules/division8/division8.controller.ts

import { Request, Response } from "express";
import { division8Service } from "./division8.service";

export const division8Controller = {
  createAgency(req: Request, res: Response) {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const agency = division8Service.createAgency({
      name,
      contacts: req.body.contacts,
      preferences: req.body.preferences,
    });
    return res.status(201).json(agency);
  },

  listAgencies(_req: Request, res: Response) {
    return res.json(division8Service.listAgencies());
  },

  getAgency(req: Request, res: Response) {
    const agency = division8Service.getAgency(req.params.id);
    if (!agency) return res.status(404).json({ error: "Agency not found" });
    return res.json(agency);
  },

  updateAgency(req: Request, res: Response) {
    const agency = division8Service.updateAgency(req.params.id, req.body);
    if (!agency) return res.status(404).json({ error: "Agency not found" });
    return res.json(agency);
  },

  linkContract(req: Request, res: Response) {
    const { contractId } = req.body;
    if (!contractId) return res.status(400).json({ error: "contractId is required" });
    const agency = division8Service.linkContract(req.params.id, contractId);
    if (!agency) return res.status(404).json({ error: "Agency not found" });
    return res.json(agency);
  },

  linkRequest(req: Request, res: Response) {
    const { requestId } = req.body;
    if (!requestId) return res.status(400).json({ error: "requestId is required" });
    const agency = division8Service.linkRequest(req.params.id, requestId);
    if (!agency) return res.status(404).json({ error: "Agency not found" });
    return res.json(agency);
  },
};
