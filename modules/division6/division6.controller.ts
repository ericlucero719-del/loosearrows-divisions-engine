// modules/division6/division6.controller.ts
// Division 6 — Compliance & Documentation

import { Request, Response } from "express";
import { division6Service } from "./division6.service";

export const division6Controller = {

  docTypes(_req: Request, res: Response) {
    return res.json(division6Service.docTypes());
  },

  async listDocs(req: Request, res: Response) {
    try {
      const { docType, status } = req.query as Record<string, string | undefined>;
      return res.json(await division6Service.listDocs(docType, status));
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async getDoc(req: Request, res: Response) {
    try {
      const doc = await division6Service.getDoc(req.params.docId);
      if (!doc) return res.status(404).json({ error: "Document not found" });
      return res.json(doc);
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async createDoc(req: Request, res: Response) {
    try {
      const { docType, title } = req.body;
      if (!docType || !title) return res.status(400).json({ error: "docType and title are required" });
      return res.status(201).json(await division6Service.createDoc(req.body));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async updateDoc(req: Request, res: Response) {
    try {
      return res.json(await division6Service.updateDoc(req.params.docId, req.body));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },

  async deleteDoc(req: Request, res: Response) {
    try {
      await division6Service.deleteDoc(req.params.docId);
      return res.json({ deleted: req.params.docId });
    } catch (e: any) { return res.status(404).json({ error: e.message }); }
  },

  async complianceStatus(_req: Request, res: Response) {
    try {
      return res.json(await division6Service.complianceStatus());
    } catch (e: any) { return res.status(500).json({ error: e.message }); }
  },

  async generateCapabilityStatement(req: Request, res: Response) {
    try {
      const { companyName } = req.body;
      if (!companyName) return res.status(400).json({ error: "companyName is required" });
      return res.json(await division6Service.generateCapabilityStatement(req.body));
    } catch (e: any) { return res.status(400).json({ error: e.message }); }
  },
};
