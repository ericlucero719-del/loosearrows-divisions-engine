// modules/division6/division6.controller.ts

import { Request, Response } from "express";
import { division6Service } from "./division6.service";

export const division6Controller = {
  createRequirement(req: Request, res: Response) {
    const { entityType, entityId } = req.body;
    const documentType: string = req.body.documentType ?? req.body.requirement ?? req.body.name;
    if (!entityType || !entityId || !documentType) {
      return res.status(400).json({ error: "entityType, entityId, and documentType (or requirement) are required" });
    }
    const req_ = division6Service.createRequirement({ entityType, entityId, documentType });
    return res.status(201).json(req_);
  },

  attachDocument(req: Request, res: Response) {
    const { url, uploadedBy, uploadedAt } = req.body;
    const name: string = req.body.name ?? req.body.documentName ?? req.body.fileName;
    if (!name) return res.status(400).json({ error: "name (or documentName) is required" });
    const result = division6Service.attachDocument(req.params.id, { name, url, uploadedBy, uploadedAt });
    if (!result) return res.status(404).json({ error: "Compliance requirement not found" });
    return res.json(result);
  },

  attachDocumentByEntity(req: Request, res: Response) {
    const { entityType, entityId, url, uploadedBy, uploadedAt } = req.body;
    const name: string = req.body.name ?? req.body.documentName ?? req.body.fileName;
    if (!entityType || !entityId || !name) {
      return res.status(400).json({ error: "entityType, entityId, and documentName are required" });
    }
    const result = division6Service.attachDocumentByEntity(entityType, entityId, { name, url, uploadedBy, uploadedAt });
    if (!result) return res.status(404).json({ error: "No compliance requirement found for this entity" });
    return res.json(result);
  },

  listRequirements(req: Request, res: Response) {
    const { entityId, entityType } = req.query as Record<string, string | undefined>;
    return res.json(division6Service.listRequirements({ entityId, entityType }));
  },

  getRequirement(req: Request, res: Response) {
    const result = division6Service.getRequirement(req.params.id);
    if (!result) return res.status(404).json({ error: "Compliance requirement not found" });
    return res.json(result);
  },
};
