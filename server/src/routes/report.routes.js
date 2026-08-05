import express from "express";
import {
  getReports,
  createReport,
  getReportsByStation,
} from "../controllers/report.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createReportSchema } from "../validators/report.validator.js";

const router = express.Router();

router.get("/", getReports);
router.post("/", protect, validate(createReportSchema), createReport);
router.get("/station/:stationId", getReportsByStation);

export default router;
