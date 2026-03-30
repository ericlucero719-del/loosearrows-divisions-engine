// src/routes/rapidResponseOperatorRoute.js

const express = require("express");
const router = express.Router();

const { RapidResponseOperatorService } = require("../services/RapidResponseOperatorService");

const operatorService = new RapidResponseOperatorService();

router.get("/operators", (req, res) => {
  return res.json(operatorService.getAll());
});

router.post("/operators", (req, res) => {
  const operator = req.body;
  const created = operatorService.add(operator);
  return res.json(created);
});

router.patch("/operators/:id", (req, res) => {
  const updated = operatorService.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Operator not found" });
  return res.json(updated);
});

module.exports = router;
