import React from "react";
import { Route, Routes, useMatch } from "react-router-dom";
import Home from "./pages/student/Home";
import Player from "./pages/student/Player";
import Loading from "./components/student/Loading";
import Educator from "./pages/educator/Educator";
import Dashboard from "./pages/educator/Dashboard";
import AddCourse from "./pages/educator/AddCourse";
import MyCourses from "./pages/educator/MyCourses";
import MyEnrollments from "./pages/student/MyEnrollments";

import CourseList from "./pages/student/CourseList";
import CourseDetails from "./pages/student/CourseDetails";
import Navbar from "./components/student/Navbar";
import StudentsEnrolled from "./components/educator/StudentsEnrolled";
import "quill/dist/quill.core.css";

const App = () => {
  const isEducatorRoute = useMatch("/educator/*"); // ✅ Move inside the component

  return (
    <div className="text-default min-h-screen bg-white">
      {!isEducatorRoute && <Navbar />} {/* ✅ Correct Navbar check */}

      <Routes>
        {/* Student Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/course-list" element={<CourseList />} />
        <Route path="/course-list/:input" element={<CourseList />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/my-enrollments" element={<MyEnrollments />} />
        <Route path="/player/:courseId" element={<Player />} />
        <Route path="/loading/:path" element={<Loading />} />

        {/* Educator Routes (Nested under /educator) */}
        <Route path="/educator" element={<Educator />}>
          <Route index element={<Dashboard />} /> {/* ✅ Default route */}
          <Route path="add-course" element={<AddCourse />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="students-enrolled" element={<StudentsEnrolled/>} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
