import Course from "../models/Course.js";
import Purchase from "../models/purchase.js";
import User from "../models/User.js";
import Stripe from "stripe";

// Get all published courses
export const getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(); // 🔍 Check without filter
    console.log("All courses in DB:", allCourses);

    const publishedCourses = await Course.find({ isPublished: true })
      .select(["-courseContent", "-enrolledStudents"])
      .populate({ path: "educator" });

    console.log("Published courses:", publishedCourses); // 🔍 Check filtered data

    if (!publishedCourses.length) {
      return res
        .status(404)
        .json({ success: false, message: "No courses found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Courses retrieved successfully",
        courses: publishedCourses,
      });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to retrieve courses",
        error: error.message,
      });
  }
};

// Get course by ID
export const getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const courseData = await Course.findById(id).populate({ path: "educator" });

    if (!courseData)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    // Remove lectureUrl if isPreviewFree is false
    courseData.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        if (!lecture.isPreviewFree) lecture.lectureUrl = "";
      });
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Course retrieved successfully",
        course: courseData,
      });
  } catch (error) {
    console.error("Error fetching course:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to retrieve course",
        error: error.message,
      });
  }
};

// Purchase Course (Stripe Payment)
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers; // Origin URL for redirect after payment
    const userId = req.auth?.userId; // Ensure user is authenticated

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

    // Calculate discounted price
    const finalAmount = parseFloat(
      (courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2)
    );

    // Save purchase record in the database
    const newPurchase = await Purchase.create({
      courseId: courseData._id,
      userId,
      amount: finalAmount,
    });

    // Fallback to 'http://localhost:3000' if origin is undefined
    const baseOrigin = origin || 'http://localhost:5173';

    // Stripe payment session
    const currency = process.env.CURRENCY.toLowerCase(); // Ensure currency is lowercase
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
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
            unit_amount: Math.round(finalAmount * 100), // Convert to cents
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
      session_url: session.url, // ✅ Fixed session_url return
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
