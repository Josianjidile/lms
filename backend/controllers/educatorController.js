import { clerkClient } from "@clerk/express";
import Course from "../models/course.js";
import { v2 as cloudinary } from "cloudinary";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js"; 

// Update user role to "educator"
export const updateRoleToEducator = async (req, res) => {
  try {

    const userId = req.auth?.userId;
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role: "educator" },
    });

    res.status(200).json({ success: true, message: "Role updated to educator! You can publish a course now." });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ success: false, message: "Error updating role", error: error.message });
  }
};

// Add a new course with image upload
export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;
    const educatorId = req.auth?.userId;

    if (!educatorId) return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
    if (!imageFile) return res.status(400).json({ success: false, message: "Thumbnail not attached" });

    const parsedCourseData = JSON.parse(courseData);
    parsedCourseData.educator = educatorId;

    // Upload image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    parsedCourseData.courseThumbnail = imageUpload.secure_url;

    // Save course to database
    const newCourse = await Course.create(parsedCourseData);

    res.status(201).json({ success: true, message: "Course added successfully", course: newCourse });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ success: false, message: "Failed to create course", error: error.message });
  }
};

// Get all courses for a specific educator
export const getEducatorCourses = async (req, res) => {
  try {
    const educatorId = req.auth?.userId;

    if (!educatorId) return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });

    const courses = await Course.find({ educator: educatorId });

    res.status(200).json({ success: true, message: "Courses retrieved successfully", courses });
  } catch (error) {
    console.error("Error fetching educator courses:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve courses", error: error.message });
  }
};


// Get educator dashboard data
export const getEducatorDashboard = async (req, res) => {
  try {
    const educatorId = req.auth?.userId;

    if (!educatorId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
    }

    // Get educator's courses
    const courses = await Course.find({ educator: educatorId });
    const totalCourses = courses.length;

    // Get course IDs
    const courseIds = courses.map((course) => course._id);

    // Get completed purchases for these courses
    const purchases = await Purchase.find({ courseId: { $in: courseIds }, status: "completed" });

    // Calculate total earnings
    const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

    // Collect enrolled students with their course titles
    const enrolledStudentsData = [];
    for (const course of courses) {
      const students = await User.find(
        { _id: { $in: course.enrolledStudents } },
        "name imageUrl"
      );
      students.forEach((student) => {
        enrolledStudentsData.push({
          courseTitle: course.courseTitle,
          student,
        });
      });
    }

    res.json({
      success: true,
      dashboardData: {
        totalCourses,
        totalEarnings,
        enrolledStudents: enrolledStudentsData,
      },
    });
  } catch (error) {
    console.error("Error fetching educator dashboard data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
      error: error.message,
    });
  }
};

// Get enrolled students data with purchase details
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educatorId = req.auth?.userId;

    if (!educatorId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
    }

    // Find educator's courses
    const courses = await Course.find({ educator: educatorId });
    const courseIds = courses.map((course) => course._id);

    // Find completed purchases with user and course details
    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");

    // Map data correctly
    const enrolledStudents = purchases.map((purchase) => ({
      student: purchase.userId,
      courseTitle: purchase.courseId.courseTitle,
      purchaseDate: purchase.createdAt,
    }));

    res.json({ success: true, enrolledStudents });
  } catch (error) {
    console.error("Error fetching enrolled students data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve enrolled students",
      error: error.message,
    });
  }
};