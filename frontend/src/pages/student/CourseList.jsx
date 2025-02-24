import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import SearchBar from "../../components/student/SearchBar";
import { useParams, useNavigate } from "react-router-dom";
import CourseCard from "../../components/student/CourseCard";
import Footer from "../../components/student/Footer";
import { assets } from "../../assets/assets";

const CourseList = () => {
  const { navigate, allCourses } = useContext(AppContext);
  const { input } = useParams();
  const [filteredCourse, setFilteredCourse] = useState([]);

  useEffect(() => {
    if (allCourses && allCourses.length > 0) {
      const tempCourses = allCourses.slice(); // Copy array to avoid mutation

      // Filter courses based on input
      if (input) {
        const filtered = tempCourses.filter(course =>
          course.courseTitle.toLowerCase().includes(input.toLowerCase())
        );
        setFilteredCourse(filtered);
      } else {
        setFilteredCourse(tempCourses);
      }
    }
  }, [allCourses, input]);

  const onClearSearch = () => {
    navigate("/courses"); // Reset input by navigating to the courses list
  };

  return (
   <>
    <div className="relative md:px-36 px-8 pt-20 text-left">
      <div className="flex md:flex-row flex-col gap-6 items-start justify-between w-full">
        <div>
          <h1 className="text-4xl font-semibold text-gray-800">Course List</h1>
          <p className="text-gray-500">
            <span
              onClick={() => navigate("/")}
              className="text-blue-500 cursor-pointer"
            >
              Home
            </span>{" "}
            l <span>Course List</span>
          </p>
        </div>
        <SearchBar data={input} />
      </div>

      {/* Display input with close icon when searching */}
      {input && (
        <div className="inline-flex items-center gap-4  bg-gray-100 px-4 py-2 border mt-8-mb-8 rounded-md">
          <p className="text-gray-600">{input}</p>
          <img
            src={assets.cross_icon}
            alt="Clear search"
            className="cursor-pointer"
            onClick={()=>{
              navigate('/course-list')
            }}
          />
        </div>
      )}

      {/* Course Grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredCourse.length > 0 ? (
          filteredCourse.map((course) => (
            <CourseCard key={course.id || course.courseTitle} course={course} />
          ))
        ) : (
          <p className="text-gray-500">No courses found</p>
        )}
      </div>
    </div>
    <Footer/>
   </>
  );
};

export default CourseList;
