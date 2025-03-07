import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { updateRoleToEducator, addCourse, getEducatorCourses,getEnrolledStudentsData,getEducatorDashboard } from "../controllers/educatorController.js";
import upload from "../config/multer.js";

const educatorRouter = express.Router();

educatorRouter.get("/update-role", clerkMiddleware(), updateRoleToEducator);
educatorRouter.post("/add-course", clerkMiddleware(), upload.single("image"), addCourse);
educatorRouter.get("/courses", clerkMiddleware(), getEducatorCourses);
educatorRouter.get("/dashboard", clerkMiddleware(), getEducatorDashboard);
educatorRouter.get("/enrolled-students", clerkMiddleware(), getEnrolledStudentsData);

export default educatorRouter;
