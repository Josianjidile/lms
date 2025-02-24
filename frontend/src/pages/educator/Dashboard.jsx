import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { assets, dummyDashboardData } from "../../assets/assets";
import Loading from "../../components/student/Loading";

const Dashboard = () => {
  const { currency } = useContext(AppContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Simulate an API call
      setTimeout(() => {
        setDashboardData(dummyDashboardData);
        setLoading(false);
      }, 1000); // Simulate a 1-second delay
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="h-screen flex flex-col items-center justify-between md:p-8">
      <div className="w-full">
        {/* Cards Section */}
        <div className="flex flex-wrap gap-5 mb-8">
          {/* Enrolled Students Card */}
          <div className="flex items-center gap-3 shadow-card border border-teal-300 p-4 w-56 rounded-md">
            <img src={assets.patients_icon} alt="students_icon" className="w-10 h-10" />
            <div>
              <p className="text-2xl font-medium text-gray-600">
                {dashboardData.enrolledStudentsData.length}
              </p>
              <p className="text-sm text-gray-500">Enrolled Students</p>
            </div>
          </div>

          {/* Total Courses Card */}
          <div className="flex items-center gap-3 shadow-card border border-teal-300 p-4 w-56 rounded-md">
            <img src={assets.appointments_icon} alt="courses_icon" className="w-10 h-10" />
            <div>
              <p className="text-2xl font-medium text-gray-600">
                {dashboardData.totalCourses}
              </p>
              <p className="text-sm text-gray-500">Total Courses</p>
            </div>
          </div>

          {/* Total Earnings Card */}
          <div className="flex items-center gap-3 shadow-card border border-teal-300 p-4 w-56 rounded-md">
            <img src={assets.earning_icon} alt="earning_icon" className="w-10 h-10" />
            <div>
              <p className="text-2xl font-medium text-gray-600">
                {currency}
                {dashboardData.totalEarnings}
              </p>
              <p className="text-sm text-gray-500">Total Earnings</p>
            </div>
          </div>
        </div>

        {/* Latest Enrollments Table */}
        <h2 className="pb-4 text-lg font-medium">Latest Enrollments</h2>
        <div className="flex flex-col items-center max-w-4xl overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="w-full">
            <thead className="bg-gray-900 text-white border-b border-gray-500/20 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">#</th>
                <th className="px-4 py-3 font-semibold truncate">Student Name</th>
                <th className="px-4 py-3 font-semibold truncate">Course Title</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {dashboardData.enrolledStudentsData.map((item, index) => (
                <tr key={index} className="border-b border-gray-500/20">
                  {/* Row Number */}
                  <td className="px-4 py-3">{index + 1}</td>

                  {/* Student Name with Image */}
                  <td className="px-4 py-3 flex items-center gap-3 truncate">
                    <img
                      src={item.student.imageUrl}
                      alt={`${item.student.name}'s profile`}
                      className="w-10 h-10 rounded-full object-cover border border-gray-300"
                    />
                    <span className="truncate">{item.student.name}</span>
                  </td>

                  {/* Course Title */}
                  <td className="px-4 py-3 truncate">{item.courseTitle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;