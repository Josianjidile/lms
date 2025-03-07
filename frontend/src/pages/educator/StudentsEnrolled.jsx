import React, { useEffect, useState } from "react";
import { dummyStudentEnrolled } from "../../assets/assets";
import Loading from "../student/Loading";
import axios from "axios";


const StudentsEnrolled = () => {
  const [enrolledStudents, setEnrolledStudents] = useState(null);
  const { backendUrl, getToken,isEducator } = useContext(AppContext);


    const fetchEnrolledStudents = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get(`${backendUrl}/api/educator/enrolled-students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
       if(data.success) {setEnrolledStudents(data.enrolledStudents.reverse())}
       else{
        toast.error(data.message)
       }
      } catch (error) {
         toast.error(error.message)
      }
    };

    useEffect(() => {
      if(isEducator)
{    fetchEnrolledStudents();}
  }, [isEducator]);

  return enrolledStudents ? (
    <div className="h-screen flex flex-col items-center justify-between md:p-8">
      <div className="w-full">
        <h2 className="pb-4 text-lg font-medium">Students Enrolled</h2>
        <div className="flex flex-col items-center max-w-4xl overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="w-full">
            <thead className="bg-gray-900 text-white border-b border-gray-500/20 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">#</th>
                <th className="px-4 py-3 font-semibold truncate">Student Name</th>
                <th className="px-4 py-3 font-semibold truncate">Course Title</th>
                <th className="px-4 py-3 font-semibold truncate">Purchase Date</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {enrolledStudents.map((item, index) => (
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

                  {/* Purchase Date */}
                  <td className="px-4 py-3 truncate">
                    {new Date(item.purchaseDate).toLocaleDateString()}
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

export default StudentsEnrolled;
