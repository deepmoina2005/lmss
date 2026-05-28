import React, { useEffect } from "react";
import Loading from "../../components/student/Loading";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchEducatorStudents } from "../../redux/slice/educatorSlice";

const StudentsEnrolled = () => {
  const dispatch = useDispatch();
  const enrolledStudents = useSelector((state) => state.educator.enrolledStudents);
  const { studentsLoaded, loading } = useSelector((state) => state.educator);
  const user = useSelector((state) => state.auth.user);
  const isEducator = user?.role === "instructor" && user?.status === "approved";

  useEffect(() => {
    if (!isEducator) return;
    dispatch(fetchEducatorStudents()).then((result) => {
      if (fetchEducatorStudents.rejected.match(result)) {
        toast.error(result.payload || "Failed to load students");
      }
    });
  }, [dispatch, isEducator]);

  if (!studentsLoaded || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 mb-10">
      <div className="w-full">
        <h2 className="pb-4 text-lg font-medium">Student Enrolled</h2>
        {enrolledStudents.length === 0 ? (
          <div className="max-w-4xl w-full rounded-md bg-white border border-gray-500/20 p-8 text-center">
            <p className="text-lg font-medium text-gray-700">No students enrolled yet</p>
            <p className="mt-2 text-sm text-gray-500">Student enrollments will appear here after course purchases.</p>
          </div>
        ) : (
        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="table-fixed md:table-auto w-full overflow-hidden pb-4">
            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
              <tr><th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">#</th><th className="px-4 py-3 font-semibold ">Student name</th><th className="px-4 py-3 font-semibold ">Course Title</th><th className="px-4 py-3 font-semibold ">Date</th></tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {enrolledStudents.map((item, index) => (
                <tr key={index} className="border-b border-gray-500/20 ">
                  <td className="px-4 py-3 text-center hidden sm:table-cell">{index + 1}</td>
                  <td className="md:px-4 px-2 py-3 flex items-center space-x-3"><img src={item?.student?.imageUrl || "/student.png"} alt="image url" className="w-9 h-9 rounded-full bg-teal-200/40 object-cover" /><span className="truncate">{item?.student?.name || "Unknown Student"}</span></td>
                  <td className="px-4 py-3 truncate">{item.courseTitle} </td>
                  <td className="px-4 py-3">{new Date(item.purchaseDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};

export default StudentsEnrolled;
