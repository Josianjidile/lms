import express from "express";
import { clerkMiddleware } from '@clerk/express';
import { updateRoleToEducator } from "../controllers/educatorController.js";

const educatorRouter = express.Router();

// Add role to educator
educatorRouter.get('/update-role', clerkMiddleware(), updateRoleToEducator);

export default educatorRouter;
