import Course from "../models/course.js";

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

