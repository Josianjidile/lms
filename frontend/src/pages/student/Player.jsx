import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import { useParams } from "react-router-dom";
import YouTube from "react-youtube";
import Footer from "../../components/student/Footer";
import Rating from "../../components/student/Rating";

const Player = () => {
  const { enrolledCourses, calculateChapterTime, allCourses } =
    useContext(AppContext);
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);

  const getCourseData = () => {
    const course = enrolledCourses.find((course) => course._id === courseId);
    if (course) {
      setCourseData(course);
    }
  };

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    getCourseData();
  }, [courseId, enrolledCourses]); // Use `courseId` and `enrolledCourses` as dependencies

  if (!courseData) {
    return <div>Loading...</div>;
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
                      {chapter.chapterContent.map((lecture, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                lecture.isCompleted
                                  ? assets.blue_tick_icon
                                  : assets.play_icon
                              }
                              alt="play icon"
                              className="w-4 h-4 mt-1"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {lecture.lectureTitle}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div>
                              {lecture.lectureUrl && (
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
                                lecture.lectureDuration * 60 * 1000,
                                { units: ["h", "m"] }
                              )}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 py-3 mt-10">
            <h1 className=" text-xl font-bold">Rate This Course:</h1>
            <Rating initialRating={0}/>
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
                <button className="w-full py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
                  Mark as Complete
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
      <Footer/>
    </>
  );
};

export default Player;