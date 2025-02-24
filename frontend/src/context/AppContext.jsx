import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { dummyCourses } from "../assets/assets"; // You can replace this with an actual API call to fetch courses
import humanizeDuration from "humanize-duration";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY; // You can adjust how you load your environment variables
  const [allCourses, setAllCourses] = useState([]); // Store all courses
  const navigate = useNavigate(); // React Router hook to navigate between pages
  const [isEducator, setIsEducator] = useState(true); // Check if the user is an educator
  const [enrolledCourses, setEnrolledCourses] = useState([]); // Store courses the user is enrolled in

  const { getToken } = useAuth(); // Clerk's useAuth hook to get the user's authentication token
  const { user } = useUser(); // Clerk's useUser hook to get user information

  // Fetch all courses (replace with your actual API or data fetching logic)
  const fetchAllCourses = async () => {
    setAllCourses(dummyCourses); // Replace dummyCourses with actual API call if needed
  };

  // Fetch user enrolled courses (replace with actual API)
  const fetchUserEnrolledCourses = async () => {
    setEnrolledCourses(dummyCourses); // Replace dummyCourses with an actual call to get user's enrolled courses
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

  // Log the token for debugging
  const logToken = async () => {
    const token = await getToken();
    console.log("User token:", token); // Log the token to the console for debugging
  };

  useEffect(() => {
    fetchAllCourses(); // Fetch all courses on component mount
    fetchUserEnrolledCourses(); // Fetch the user's enrolled courses on component mount
  }, []);

  // Log the token once the user is available
  useEffect(() => {
    if (user) {
      logToken(); // Log the token to the console when the user is authenticated
    }
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
