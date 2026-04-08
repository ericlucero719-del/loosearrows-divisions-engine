"use strict";
// modules/division2/division2.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.division2Controller = void 0;
const division2_service_1 = require("./division2.service");
exports.division2Controller = {
    async createContract(req, res) {
        const { contractId, contractRef, contractName, agency, naics, periodOfPerformance, status } = req.body;
        if (!contractName || !agency) {
            return res.status(400).json({ error: "contractName and agency are required" });
        }
        const contract = await division2_service_1.division2Service.createContract({
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
    async listContracts(_req, res) {
        return res.json(await division2_service_1.division2Service.listContracts());
    },
    async getContract(req, res) {
        const contract = await division2_service_1.division2Service.getContract(req.params.id);
        if (!contract)
            return res.status(404).json({ error: "Contract not found" });
        return res.json(contract);
    },
    async addProduct(req, res) {
        const { sku, contractPrice, notes } = req.body;
        const clin = req.body.clin ?? req.body.CLIN;
        const price = contractPrice ?? req.body.price;
        if (!sku || price === undefined) {
            return res.status(400).json({ error: "sku and contractPrice are required" });
        }
        const result = await division2_service_1.division2Service.addProductToContract(req.params.id, {
            sku,
            clin,
            contractPrice: price,
            notes,
        });
        if (!result)
            return res.status(404).json({ error: "Contract not found" });
        return res.json(result);
    },
    async updateContract(req, res) {
        const allowed = ["status", "contractName", "agency", "naics", "periodOfPerformance", "contractRef"];
        const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
        const contract = await division2_service_1.division2Service.updateContract(req.params.id, updates);
        if (!contract)
            return res.status(404).json({ error: "Contract not found" });
        return res.json(contract);
    },
    async getContractCatalog(req, res) {
        const catalog = await division2_service_1.division2Service.getContractCatalog(req.params.id);
        if (!catalog)
            return res.status(404).json({ error: "Contract not found" });
        return res.json(catalog);
    },
};
//# sourceMappingURL=division2.controller.js.map