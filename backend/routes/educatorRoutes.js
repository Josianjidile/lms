import express from "express";
import { updateRoleToEducator } from "../controllers/educatorController.js";

const router = express.Router();

router.post("/update-role", updateRoleToEducator);

export default router;
