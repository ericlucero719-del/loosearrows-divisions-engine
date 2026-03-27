import express from "express";
import { division3Controller } from "../division3/division3.controller";

const router = express.Router();

router.post("/process", (req, res) => {
  division3Controller.handle(req, res);
});

export default router;
