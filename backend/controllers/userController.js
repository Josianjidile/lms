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


export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers; 

    const userId = req.auth?.userId;

    // Corrected the reference to userId from UserId to userId
    const userData = await User.findById(userId); 
    const courseData = await Course.findById(courseId);
    if (!userData || !courseData) {
      return res.status(404).json({ success: false, message: "Data not found" });
    }

    const purchaseData = {
      courseId: courseData._id,
      userId, 
      amount: (courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2),
    };

    const newPurchase = await Purchase.create(purchaseData);

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    console.log("Purchase created with ID:", newPurchase._id);

    const currency = process.env.CURRENCY.toLowerCase();

    const line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: courseData.courseTitle,
          },
          unit_amount: Math.floor(newPurchase.amount) * 100, // Convert amount to cents
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      line_items: line_items,
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
    console.error("Error processing purchase:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process purchase",
      error: error.message,
    });
  }
};