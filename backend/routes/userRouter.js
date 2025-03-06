import express from "express";
import { addUserRating, getEnrolledCourse, getUserCourseProgress, getUserData, purchaseCourse, updateUserCourseProgress } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/data", getUserData);
userRouter.get("/enrolled-courses", getEnrolledCourse);
userRouter.post("/purchase", purchaseCourse);
userRouter.post("/update-course-progress",updateUserCourseProgress );
userRouter.post("/get-course-progress", getUserCourseProgress);
userRouter.post("/add-rating" ,addUserRating);

export default userRouter;

