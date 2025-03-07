import mongoose from "mongoose"; // Import mongoose for ObjectId validation
import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Course from "../models/course.js";
import CourseProgress from "../models/CourseProgress.js";
import Stripe from "stripe";

// Ensure Stripe secret key is set
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in the environment variables");
}


// Get user data by ID (from authentication token)
export const getUserData = async (req, res) => {
  try {
    const userId = req.auth?.userId; // Ensure auth exists

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
    }

    const user = await User.findById(userId).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User retrieved successfully", user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve user", error: error.message });
  }
};

// Get user's enrolled courses with lecture links
export const getEnrolledCourse = async (req, res) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
    }

    const userData = await User.findById(userId).populate({
      path: "enrolledCourses",
      populate: { path: "educator", select: "name email" }, // Populate educator details
      select: "-enrolledStudents -courseRatings", // Exclude unnecessary fields
    });

    if (!userData || !userData.enrolledCourses.length) {
      return res.status(404).json({ success: false, message: "No enrolled courses found" });
    }

    res.status(200).json({
      success: true,
      message: "Enrolled courses retrieved successfully",
      enrolledCourses: userData.enrolledCourses,
    });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve courses", error: error.message });
  }
};




const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const purchaseCourse = async (req, res) => {
    console.log("Request Body:", req.body); // Debugging log
    try {
        const { courseId } = req.body;
        const { origin } = req.headers;
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User ID missing" });
        }

        const userData = await User.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const courseData = await Course.findById(courseId);
        if (!courseData) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        if (userData.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ success: false, message: "You are already enrolled in this course" });
        }

        const amount = (courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2);

        const newPurchase = await Purchase.create({
            courseId: courseData._id,
            userId: userData._id,
            amount,
            status: "pending",
        });

        console.log("Purchase created with ID:", newPurchase._id);

        const currency = process.env.CURRENCY.toLowerCase();
        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name: courseData.courseTitle,
                        },
                        unit_amount: Math.floor(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            metadata: {
                purchaseId: newPurchase._id.toString(),
            },
        });

        res.status(200).json({
            success: true,
            session_url: session.url,
        });
    } catch (error) {
        console.error("Error processing course purchase:", error);
        res.status(500).json({
            success: false,
            message: "Failed to purchase course",
            error: error.message,
        });
    }
};


// Update user course progress
export const updateUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId, lectureId } = req.body;

    let progressData = await CourseProgress.findOne({ userId, courseId });

    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.status(200).json({
          success: true,
          message: "Lecture Already completed",
        });
      }

      progressData.lectureCompleted.push(lectureId);
      await progressData.save();
    } else {
      await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId],
      });
    }

    res.status(200).json({ success: true, message: "Progress updated" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



//get user course progress

export const getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId } = req.body;

     const progressData = await CourseProgress.findOne({ userId, courseId });

    res.status(200).json({ success: true, progressData });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

 //add user rating course

 export const addUserRating = async (req, res) => {
  const userId = req.auth.userId;
  const { courseId, rating } = req.body;

  // Check for invalid rating input
  if (!courseId || !userId || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Invalid rating. Rating must be between 1 and 5." });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const user = await User.findById(userId);

    if (!user || !user.enrolledCourses.includes(courseId)) {
      return res.status(403).json({ success: false, message: "User has not purchased this course." });
    }

    const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId);

    if (existingRatingIndex > -1) {
      // Update existing rating
      course.courseRatings[existingRatingIndex].rating = rating;
    } else {
      // Add new rating
      course.courseRatings.push({ userId, rating });
    }

    await course.save();

    return res.status(200).json({ success: true, message: "Rating added successfully" });
  } catch (error) {
    console.error("Error adding rating:", error);
    return res.status(500).json({ success: false, message: "Failed to add rating", error: error.message });
  }
};

