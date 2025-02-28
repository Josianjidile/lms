import express from "express";
import { getEnrolledCourse, getUserData } from "../controllers/userController.js";
import { purchaseCourse } from "../controllers/courseController.js";


const userRouter = express.Router();

userRouter.get("/data", getUserData);
userRouter.get("/enrolled-courses", getEnrolledCourse);
userRouter.post("/purchase", purchaseCourse);

export default userRouter;
