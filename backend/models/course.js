import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    lectureId: { type: String, required: true },
    lectureOrder: { type: Number, required: true },
    lectureDuration: { type: Number, required: true },
    lectureUrl: { type: String, required: true },
    lectureTitle: { type: String, required: true },
    isPreviewFree: { type: Boolean, required: true },
  },
  { _id: false }
);

const chapterSchema = new mongoose.Schema(
  {
    chapterId: { type: String, required: true },
    chapterOrder: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    chapterContent: [lectureSchema],
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema({
  courseTitle: { type: String, required: true },
  courseDescription: { type: String, required: true },
  courseThumbnail: { type: String },
  coursePrice: { type: Number, required: true },
  discount: { type: Number, required: true, min: 0, max: 100 },
  courseContent: [chapterSchema],
  courseRatings: [
    {
      userId: { type: String, ref: "User", required: true },
      rating: { type: Number, min: 1, max: 5, required: true },
    },
  ],
  educator: { type: String, ref: "User", required: true },
  enrolledStudents: [{ type: String, ref: "User" }],
  isPublished: { type: Boolean, default: true }, // ✅ Add this if missing
}, { timestamps: true });

// Prevent model overwrite error in Mongoose
const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

export default Course;
