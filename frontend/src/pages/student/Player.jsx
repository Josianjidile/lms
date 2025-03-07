import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import { useParams } from "react-router-dom";
import YouTube from "react-youtube";
import Footer from "../../components/student/Footer";
import Rating from "../../components/student/Rating";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";
import axios from "axios";

const Player = () => {
  const { enrolledCourses, calculateChapterTime, allCourses, getToken, userData, backendUrl, FetchUserEnrolledCourses } =
    useContext(AppContext);
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);
  const [loading, setLoading] = useState(true); // Add loading state

  const getCourseData = () => {
    const course = enrolledCourses.find((course) => course._id === courseId);
    if (course) {
      setCourseData(course);
      // Ensure courseRatings exists before calling map
      if (course.courseRatings && Array.isArray(course.courseRatings)) {
        course.courseRatings.map((item) => {
          if (item.userId === userData._id) {
            setInitialRating(item.rating);
          }
        });
      } else {
        console.warn("courseRatings is undefined or not an array");
      }
    } else {
      console.warn("Course not found");
    }
  };

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const markLectureAsCompleted = async (lectureId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/update-course-progress`,
        { courseId, lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        getCourseProgress(); // Refresh progress data after marking the lecture
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/get-course-progress`,
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setProgressData(data.progressData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRate = async (rating) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/add-rating`,
        { courseId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        FetchUserEnrolledCourses();
        // Update the local state to reflect the rating immediately
        setInitialRating(rating);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseData();
    }
  }, [courseId, enrolledCourses]);

  useEffect(() => {
    getCourseProgress();
    setLoading(false); // Stop loading after course progress is fetched
  }, [courseId]); // Re-fetch progress when courseId changes

  if (loading || !courseData) {
    return <Loading />; // Show loading indicator while fetching data
  }

  return (
    <>
      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
        {/* Left Column - Course Structure */}
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold">Course Structure</h2>
          <div className="pt-5">
            {courseData.courseContent.map((chapter, index) => (
              <div
                key={index}
                className="border border-gray-200 bg-white mb-2 rounded-lg"
              >
                <div
                  onClick={() => toggleSection(index)}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={assets.down_arrow_icon}
                      alt="arrow icon"
                      className={`w-4 h-4 transition-transform ${
                        openSections[index] ? "rotate-180" : ""
                      }`}
                    />
                    <p className="font-medium md:text-base text-sm">
                      {chapter.chapterTitle}
                    </p>
                  </div>
                  <p className="text-sm md:text-default">
                    {chapter.chapterContent.length} lectures -{" "}
                    {calculateChapterTime(chapter)}
                  </p>
                </div>
                {openSections[index] && (
                  <div className="space-y-3 px-4 pb-4">
                    <ul className="space-y-2">
                      {chapter.chapterContent.map((lecture, i) => {
                        const { lectureId, lectureTitle, lectureUrl, lectureDuration } = lecture;
                        return (
                          <li
                            key={i}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <img
                                src={
                                  progressData &&
                                  progressData.lectureCompleted.includes(lectureId)
                                    ? assets.blue_tick_icon
                                    : assets.play_icon
                                }
                                alt="play icon"
                                className="w-4 h-4 mt-1"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  {lectureTitle}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div>
                                {lectureUrl && (
                                  <p
                                    onClick={() =>
                                      setPlayerData({
                                        ...lecture,
                                        chapter: index + 1,
                                        lecture: i + 1,
                                      })
                                    }
                                    className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full cursor-pointer"
                                  >
                                    Watch
                                  </p>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {humanizeDuration(
                                  lectureDuration * 60 * 1000,
                                  { units: ["h", "m"] }
                                )}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 py-3 mt-10">
            <h1 className=" text-xl font-bold">Rate This Course:</h1>
            <Rating initialRating={initialRating} onRate={handleRate} />
          </div>
        </div>

        {/* Right Column - Video Player */}
        <div className="sticky top-10 h-fit bg-white rounded-lg shadow-md p-4">
          {playerData ? (
            <div className="space-y-4">
              {/* YouTube Video Player */}
              <YouTube
                videoId={playerData.lectureUrl.split("/").pop()}
                opts={{ playerVars: { autoplay: 1 } }}
                iframeClassName="w-full aspect-video rounded-lg"
              />

              {/* Lecture Details */}
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  Chapter {playerData.chapter}, Lecture {playerData.lecture}:{" "}
                  {playerData.lectureTitle}
                </p>
                <button
                  onClick={() => markLectureAsCompleted(playerData.lectureId)}
                  className="w-full py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  {progressData && progressData.lectureCompleted.includes(playerData.lectureId)
                    ? "Completed"
                    : "Mark Complete"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              {/* Course Thumbnail */}
              <img
                src={courseData.courseThumbnail}
                alt="Course Thumbnail"
                className="w-full h-auto rounded-lg"
              />
              <p className="mt-4 text-gray-600">
                Select a lecture to start watching.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Player;
