import express from "express";
import { getEnrolledCourse, getUserData, purchaseCourse } from "../controllers/userController.js";



const userRouter = express.Router();

userRouter.get("/data", getUserData);
userRouter.get("/enrolled-courses", getEnrolledCourse);
userRouter.post("/purchase", purchaseCourse);

export default userRouter;
