// modules/division2/division2.controller.ts

import { Request, Response } from "express";
import { division2Service } from "./division2.service";

export const division2Controller = {
  createContract(req: Request, res: Response) {
    const { contractName, agency, naics, periodOfPerformance, status } = req.body;
    if (!contractName || !agency) {
      return res.status(400).json({ error: "contractName and agency are required" });
    }
    const contract = division2Service.createContract({
      contractName,
      agency,
      naics,
      periodOfPerformance,
      status: status ?? "draft",
    });
    return res.status(201).json(contract);
  },

  listContracts(_req: Request, res: Response) {
    return res.json(division2Service.listContracts());
  },

  getContract(req: Request, res: Response) {
    const contract = division2Service.getContract(req.params.id);
    if (!contract) return res.status(404).json({ error: "Contract not found" });
    return res.json(contract);
  },

  addProduct(req: Request, res: Response) {
    const { sku, contractPrice, notes } = req.body;
    if (!sku || contractPrice === undefined) {
      return res.status(400).json({ error: "sku and contractPrice are required" });
    }
    const result = division2Service.addProductToContract(req.params.id, {
      sku,
      contractPrice,
      notes,
    });
    if (!result) return res.status(404).json({ error: "Contract not found" });
    return res.json(result);
  },

  getContractCatalog(req: Request, res: Response) {
    const catalog = division2Service.getContractCatalog(req.params.id);
    if (!catalog) return res.status(404).json({ error: "Contract not found" });
    return res.json(catalog);
  },
};
