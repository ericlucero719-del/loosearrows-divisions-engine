// modules/reseller/reseller.routes.ts
// LooseArrows Supply & Logistics™ — Reseller Network Engine
//
// GET    /api/resellers                      — list all resellers (?status= ?tier=)
// GET    /api/resellers/summary              — platform-wide stats + top resellers
// GET    /api/resellers/tiers               — fee tier configuration
// GET    /api/resellers/simulate             — revenue model (?resellers=20000&gmv=1000)
// POST   /api/resellers/register             — onboard new reseller { name, email, platform }
// GET    /api/resellers/:id                  — single reseller detail
// GET    /api/resellers/:id/earnings         — earnings breakdown + payout history
// POST   /api/resellers/:id/sale             — record a sale { grossSaleUsd }
// POST   /api/resellers/:id/payout           — trigger payout { method, reference }
// PATCH  /api/resellers/:id/status           — update status { status }

import { Router } from "express";
import { requireApiKey } from "../../src/middleware/apiKey";
import { operatorWorkflow } from "../../src/core/engine";
import { resellerController } from "./reseller.controller";

const router = Router();
router.use(requireApiKey);

router.get("/summary",          operatorWorkflow("RESELLER", "SUMMARY"),       resellerController.summary);
router.get("/tiers",            operatorWorkflow("RESELLER", "TIERS"),         resellerController.tiers);
router.get("/simulate",         operatorWorkflow("RESELLER", "SIMULATE"),      resellerController.simulate);
router.post("/register",        operatorWorkflow("RESELLER", "REGISTER"),      resellerController.register);
router.get("/",                 operatorWorkflow("RESELLER", "LIST"),          resellerController.list);
router.get("/:id",              operatorWorkflow("RESELLER", "GET"),           resellerController.get);
router.get("/:id/earnings",     operatorWorkflow("RESELLER", "EARNINGS"),      resellerController.earnings);
router.post("/:id/sale",        operatorWorkflow("RESELLER", "RECORD_SALE"),   resellerController.recordSale);
router.post("/:id/payout",      operatorWorkflow("RESELLER", "PAYOUT"),       resellerController.payout);
router.patch("/:id/status",     operatorWorkflow("RESELLER", "STATUS"),       resellerController.updateStatus);

export default router;
