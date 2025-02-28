import User from "../models/User.js";

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

        const userData = await User.findById(userId)
            .populate({
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
