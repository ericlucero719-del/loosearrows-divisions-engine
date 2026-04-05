// modules/division10/division10.controller.ts

import { Request, Response } from "express";
import { division10Service } from "./division10.service";

export const division10Controller = {
  getSystemSummary(_req: Request, res: Response) {
    return res.json(division10Service.getSystemSummary());
  },

  getActions(req: Request, res: Response) {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    return res.json(division10Service.getActions(limit));
  },

  getSystemHealth(_req: Request, res: Response) {
    return res.json(division10Service.getSystemHealth());
  },

  getOperatorInfo(_req: Request, res: Response) {
    return res.json(division10Service.getOperatorInfo());
  },

  getFinancials(_req: Request, res: Response) {
    return res.json(division10Service.getFinancials());
  },

  getInventory(_req: Request, res: Response) {
    return res.json(division10Service.getInventory());
  },

  getOperators(_req: Request, res: Response) {
    return res.json(division10Service.getOperators());
  },

  getContracts(_req: Request, res: Response) {
    return res.json(division10Service.getContracts());
  },

  getAlerts(_req: Request, res: Response) {
    return res.json(division10Service.getAlerts());
  },

  getFullReport(_req: Request, res: Response) {
    return res.json(division10Service.getFullReport());
  },

  getMargins(_req: Request, res: Response) {
    return res.json(division10Service.getMargins());
  },

  getSupply(_req: Request, res: Response) {
    return res.json(division10Service.getSupply());
  },

  getPipeline(_req: Request, res: Response) {
    return res.json(division10Service.getPipeline());
  },

  getAssessment(_req: Request, res: Response) {
    return res.json(division10Service.getAssessment());
  },
};
