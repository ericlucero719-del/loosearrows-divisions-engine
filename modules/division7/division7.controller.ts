// modules/division7/division7.controller.ts

import { Request, Response } from "express";
import { division7Service } from "./division7.service";

export const division7Controller = {
  createVendor(req: Request, res: Response) {
    const name: string = req.body.name ?? req.body.vendorName;
    if (!name) return res.status(400).json({ error: "name (or vendorName) is required" });
    const vendor = division7Service.createVendor({
      name,
      categories: req.body.categories ?? [],
      capabilities: req.body.capabilities ?? [],
      performanceNotes: req.body.performanceNotes,
      contactEmail: req.body.contactEmail,
      status: req.body.status ?? "pending",
    });
    return res.status(201).json(vendor);
  },

  listVendors(_req: Request, res: Response) {
    return res.json(division7Service.listVendors());
  },

  getVendor(req: Request, res: Response) {
    const vendor = division7Service.getVendor(req.params.id);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    return res.json(vendor);
  },

  updateVendor(req: Request, res: Response) {
    const vendor = division7Service.updateVendor(req.params.id, req.body);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    return res.json(vendor);
  },

  attachVendor(req: Request, res: Response) {
    const { type, referenceId } = req.body;
    if (!type || !referenceId) {
      return res.status(400).json({ error: "type and referenceId are required" });
    }
    const vendor = division7Service.attach(req.params.id, type, referenceId);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    return res.json(vendor);
  },
};
