// modules/division2/division2.controller.ts

import { Request, Response } from "express";
import { division2Service } from "./division2.service";

export const division2Controller = {
  async createContract(req: Request, res: Response) {
    const { contractId, contractRef, contractName, agency, naics, periodOfPerformance, status } = req.body;
    if (!contractName || !agency) {
      return res.status(400).json({ error: "contractName and agency are required" });
    }
    const contract = await division2Service.createContract({
      contractId,
      contractRef,
      contractName,
      agency,
      naics,
      periodOfPerformance,
      status: status ?? "draft",
    });
    return res.status(201).json(contract);
  },

  async listContracts(_req: Request, res: Response) {
    return res.json(await division2Service.listContracts());
  },

  async getContract(req: Request, res: Response) {
    const contract = await division2Service.getContract(req.params.id);
    if (!contract) return res.status(404).json({ error: "Contract not found" });
    return res.json(contract);
  },

  async addProduct(req: Request, res: Response) {
    const { sku, contractPrice, notes } = req.body;
    const clin: string | undefined = req.body.clin ?? req.body.CLIN;
    const price: number = contractPrice ?? req.body.price;
    if (!sku || price === undefined) {
      return res.status(400).json({ error: "sku and contractPrice are required" });
    }
    const result = await division2Service.addProductToContract(req.params.id, {
      sku,
      clin,
      contractPrice: price,
      notes,
    });
    if (!result) return res.status(404).json({ error: "Contract not found" });
    return res.json(result);
  },

  async updateContract(req: Request, res: Response) {
    const allowed = ["status", "contractName", "agency", "naics", "periodOfPerformance", "contractRef"];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );
    const contract = await division2Service.updateContract(req.params.id, updates as any);
    if (!contract) return res.status(404).json({ error: "Contract not found" });
    return res.json(contract);
  },

  async getContractCatalog(req: Request, res: Response) {
    const catalog = await division2Service.getContractCatalog(req.params.id);
    if (!catalog) return res.status(404).json({ error: "Contract not found" });
    return res.json(catalog);
  },
};
