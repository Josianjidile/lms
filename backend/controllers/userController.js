import mongoose from "mongoose"; // Import mongoose for ObjectId validation
import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Course from "../models/course.js";
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