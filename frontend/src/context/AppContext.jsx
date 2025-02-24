import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { dummyCourses } from "../assets/assets"; // Replace with actual API call
import humanizeDuration from "humanize-duration";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const [allCourses, setAllCourses] = useState([]);
  const navigate = useNavigate();
  const [isEducator, setIsEducator] = useState(false); // Default to false
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const { getToken } = useAuth();
  const { user } = useUser();

  // Fetch all courses
  const fetchAllCourses = async () => {
    setAllCourses(dummyCourses); // Replace with actual API call
  };

  // Fetch user enrolled courses
  const fetchUserEnrolledCourses = async () => {
    setEnrolledCourses(dummyCourses); // Replace with actual API call
  };

  // Check if the user is an educator
  const checkEducatorRole = async () => {
    if (user) {
      const role = user.publicMetadata?.role;
      setIsEducator(role === "educator");
    }
  };

  // Calculate average rating of a course
  const calculateRating = (course) => {
    if (course.courseRatings.length === 0) return 0;
    let totalRating = 0;
    course.courseRatings.forEach((rating) => {
      totalRating += rating.rating;
    });
    return totalRating / course.courseRatings.length;
  };

  // Calculate chapter time duration
  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration));
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // Calculate course total duration
  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.map((chapter) =>
      chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration))
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // Calculate the total number of lectures in a course
  const calculateNoOfLectures = (course) => {
    let totalLectures = 0;
    course.courseContent.forEach((chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length;
      }
    });
    return totalLectures;
  };

  useEffect(() => {
    fetchAllCourses();
    fetchUserEnrolledCourses();
    checkEducatorRole(); // Check educator role on user change
  }, [user]);

  const value = {
    currency,
    allCourses,
    navigate,
    isEducator,
    enrolledCourses,
    calculateRating,
    calculateCourseDuration,
    calculateNoOfLectures,
    calculateChapterTime,
    fetchUserEnrolledCourses,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};