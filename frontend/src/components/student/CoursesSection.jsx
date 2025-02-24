import React, { useContext } from "react";
import { Link } from "react-router-dom";
import CourseCard from "./CourseCard";
import { AppContext } from "../../context/AppContext";

const CoursesSection = () => {
  const { allCourses } = useContext(AppContext);

  return (
    <div className="py-16 md:px-40 px-8 text-center">
      <h2 className="text-3xl font-medium text-gray-800">Learn from the Best</h2>
      <p className="text-sm md:text-base text-gray-500 mt-3 max-w-3xl mx-auto">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni ex quod
        architecto dolorem inventore enim quis, dolor possimus sequi, totam
        doloremque esse nulla quasi autem. Incidunt repudiandae sit aliquid
        quis?
      </p>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {allCourses.slice(0, 4).map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>

      {/* Show All Courses Button */}
      <Link
        to="/course-list"
        onClick={() => scrollTo(0, 0)}
        className="text-gray-500 border border-gray-500/30 px-10 py-3 rounded mt-6 inline-block"
      >
        Show All Courses
      </Link>
    </div>
  );
};

export default CoursesSection;
