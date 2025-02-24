import React, { useState } from "react";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import {Line} from 'rc-progress'
import Footer from "../../components/student/Footer";

const MyEnrollments = () => {
  const { enrolledCourses, calculateCourseDuration,navigate } = useContext(AppContext);
  const [progressArray, setProgressArray] = useState([
    { lectureCompleted: 2, totalLectures: 4 },
    { lectureCompleted: 1, totalLectures: 5 },
    { lectureCompleted: 3, totalLectures: 6 },
    { lectureCompleted: 4, totalLectures: 4 },
    { lectureCompleted: 0, totalLectures: 3 },
    { lectureCompleted: 5, totalLectures: 7 },
    { lectureCompleted: 6, totalLectures: 8 },
    { lectureCompleted: 2, totalLectures: 6 },
    { lectureCompleted: 4, totalLectures: 10 },
    { lectureCompleted: 3, totalLectures: 5 },
    { lectureCompleted: 7, totalLectures: 7 },
    { lectureCompleted: 1, totalLectures: 4 },
    { lectureCompleted: 0, totalLectures: 2 },
    { lectureCompleted: 5, totalLectures: 5 },
  ]);

  return (
   <>
    <div className="md:px-36 px-8 pt-10 -z-1 bg-gradient-to-b from-cyan-100/70">
      <h1 className="text-2xl font-semibold mb-6">My Enrollments</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm ">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Completed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {enrolledCourses.map((course, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 flex items-center space-x-4">
                  <img
                    src={course.courseThumbnail}
                    alt={course.courseTitle}
                    className="w-14 h-14 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-lg"
                  />
                  <p className="text-sm sm:text-base font-medium text-gray-900">
                    {course.courseTitle}
                    <Line strokeWidth={2} percent={progressArray[index]? (progressArray[index].lectureCompleted *100)/progressArray[index].totalLectures : 0} className="bg-gray-300 rounded-full"/>
                  </p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {calculateCourseDuration(course)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {progressArray[index] &&
                    `${progressArray[index].lectureCompleted} / ${progressArray[index].totalLectures}`}
                  <span className="text-gray-500"> Lectures</span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={(()=> navigate('/player/' + course._id))} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  {progressArray[index] &&
                    progressArray[index].lectureCompleted / progressArray[index].totalLectures ===1 ? "Completed" : "Ongoing"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <Footer/>
   </>
  );
};

export default MyEnrollments;
