import mongoose from "mongoose"; // Import mongoose for ObjectId validation
import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";
import Stripe from "stripe";

// Ensure Stripe secret key is set
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in the environment variables");
}

// Initialize Stripe instance
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

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

// Purchase Course (Stripe Payment)
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers; // Origin URL for redirect after payment
    const userId = req.auth?.userId; // Ensure user is authenticated

    // Check if userId is present
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
    }

    // Find user and course
    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      return res.status(404).json({ success: false, message: "User or Course not found" });
    }

    // Check if user is already enrolled
    if (userData.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ success: false, message: "You are already enrolled in this course" });
    }

    // Calculate the final amount after discount
    const amount = (courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2);

    // Save purchase record in the database
    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount: parseFloat(amount), // Ensure amount is a number
      status: "pending", // Initial status
    };

    const newPurchase = await Purchase.create(purchaseData);

    const baseOrigin = origin || "http://localhost:5173";

    // Stripe payment session
    const currency = process.env.CURRENCY.toLowerCase(); // Ensure currency is lowercase
    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${baseOrigin}/loading/my-enrollments`,
      cancel_url: `${baseOrigin}/`,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: courseData.courseTitle,
            },
            unit_amount: Math.round(newPurchase.amount * 100), // Convert to cents
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
      session_url: session.url, // URL for Stripe checkout
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