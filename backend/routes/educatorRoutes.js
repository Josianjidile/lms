import express from "express";
import { updateRoleToEducator } from "../controllers/educatorController.js";

const router = express.Router();

// Use POST instead of GET for updating user metadata
router.post("/update-role", updateRoleToEducator);

export default router;