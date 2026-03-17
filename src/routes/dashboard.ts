import express from "express";
import { OperatorDashboard } from "../division2/dashboard/operatorDashboard";

const router = express.Router();
const dashboard = new OperatorDashboard();

router.get("/orders", (req, res) => {
  const view = dashboard.getOrdersView();
  res.json(view);
});

router.get("/po", (req, res) => {
  const view = dashboard.getPoView();
  res.json(view);
});

router.get("/tracking", (req, res) => {
  const view = dashboard.getTrackingView();
  res.json(view);
});

router.get("/performance", (req, res) => {
  const view = dashboard.getPerformanceView();
  res.json(view);
});

router.get("/errors", (req, res) => {
  const view = dashboard.getErrorView();
  res.json(view);
});

router.get("/automation-log", (req, res) => {
  const view = dashboard.getAutomationLogView();
  res.json(view);
});

export default router;