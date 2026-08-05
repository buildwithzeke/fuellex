import express from "express";
import {
  getStations,
  getStationById,
  createStation,
  updateStation,
  deleteStation,
} from "../controllers/station.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createStationSchema, updateStationSchema } from "../validators/station.validator.js";

const router = express.Router();

router.get("/", getStations);
router.get("/:id", getStationById);
router.post("/", protect, validate(createStationSchema), createStation);
router.put("/:id", protect, validate(updateStationSchema), updateStation);
router.delete("/:id", protect, deleteStation);

export default router;
