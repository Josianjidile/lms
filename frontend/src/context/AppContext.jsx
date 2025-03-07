import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import axios from "axios";
import humanizeDuration from "humanize-duration";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currency = import.meta.env.VITE_CURRENCY; // Adjust based on your env setup
  const [allCourses, setAllCourses] = useState([]);
  const navigate = useNavigate();
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);

  const { getToken } = useAuth();
  const { user } = useUser();

  // Fetch all courses
  const fetchAllCourses = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/course/all`);
      if (data.success) {
        setAllCourses(data.courses);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error(error.response?.data?.message || "Failed to fetch courses.");
    }
  };

  // Fetch user data only if user is logged in
  const fetchUserData = async () => {
    if (!user) {
      console.log("User not authenticated, skipping fetchUserData");
      return; // Do nothing if user is not authenticated
    }

    if (user.publicMetadata.role === "educator") {
      setIsEducator(true);
    }

    try {
      const token = await getToken();

      if (!token) {
        toast.error("Authentication token missing.");
        return;
      }

      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserData(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(error.response?.data?.message || "Failed to fetch user data.");
    }
  };

  // Fetch user enrolled courses only if user is logged in
  const fetchUserEnrolledCourses = async () => {
    if (!user) {
      console.log("User not authenticated, skipping fetchUserEnrolledCourses");
      return; // Do nothing if user is not authenticated
    }

    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/user/enrolled-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setEnrolledCourses(data.enrolledCourses.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      toast.error(error.response?.data?.message || "Failed to fetch enrolled courses.");
    }
  };

  // Calculate average rating of a course
  const calculateRating = (course) => {
    if (course.courseRatings.length === 0) return 0;
    let totalRating = 0;
    course.courseRatings.forEach((rating) => {
      totalRating += rating.rating;
    });
    return Math.floor(totalRating / course.courseRatings.length);
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
    if (user) {
      fetchUserData();
      fetchUserEnrolledCourses();
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
    backendUrl,
    userData,
    setUserData,
    getToken,
    fetchAllCourses,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
