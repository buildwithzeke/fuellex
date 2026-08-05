import express from "express";
import { getUsers } from "../controllers/user.controller.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// Restrict this entire router's routes to Admin users
router.get("/", protect, restrictTo("ADMIN"), getUsers);

export default router;
