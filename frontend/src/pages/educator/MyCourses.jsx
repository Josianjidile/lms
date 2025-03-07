import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import { toast } from "react-toastify";
import axios from "axios";


const MyCourses = () => {
  const { currency, allCourses,backendUrl,isEducator,getToken } = useContext(AppContext);
  const [courses, setCourses] = useState([]);

 
    const fetchEducatorCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/educator/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      data.success && setCourses(data.courses)
    } catch (error) {
       toast.error(error.message)
    }
    };
    useEffect(() => {
      if(isEducator)
    fetchEducatorCourses();
  }, [isEducator]);

  return courses && courses.length > 0 ? (
    <div className="h-screen flex flex-col items-center justify-between md:p-8">
      <div className="w-full">
        <h2 className="pb-4 text-lg font-medium">My Courses</h2>
        <div className="flex flex-col items-center max-w-4xl overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="w-full">
            <thead className="bg-gray-900 text-white border-b border-gray-500/20 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">Course</th>
                <th className="px-4 py-3 font-semibold truncate">Earnings</th>
                <th className="px-4 py-3 font-semibold truncate">Students</th>
                <th className="px-4 py-3 font-semibold truncate">Published On</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {courses.map((course) => (
                <tr key={course._id} className="border-b border-gray-500/20">
                  {/* Course Title with Image */}
                  <td className="px-4 py-3 flex items-center gap-3 truncate">
                    <img src={course.courseThumbnail} alt="course" className="w-16 rounded-md" />
                    <span className="truncate hidden md:block">{course.courseTitle}</span>
                  </td>

                  {/* Earnings Calculation */}
                  <td className="px-4 py-3">
                    {currency}
                    {Math.floor(
                      course.enrolledStudents.length *
                        (course.coursePrice - (course.discount * course.coursePrice) / 100)
                    )}
                  </td>

                  {/* Students Count */}
                  <td className="px-4 py-3">{course.enrolledStudents.length}</td>

                  {/* Published Date */}
                  <td className="px-4 py-3">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MyCourses;
