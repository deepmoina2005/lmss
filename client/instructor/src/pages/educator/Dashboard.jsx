import React, { useEffect, useMemo } from "react";
import { assets } from "../../assets/assets";
import Loading from "../../components/student/Loading";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchEducatorDashboard } from "../../redux/slice/educatorSlice";
import { appConfig } from "../../redux/service/api";

const Dashboard = () => {
  const dispatch = useDispatch();
  const currency = appConfig.currency || "INR ";
  const dashboardData = useSelector((state) => state.educator.dashboard);
  const user = useSelector((state) => state.auth.user);
  const isEducator = user?.role === "instructor" && user?.status === "approved";

  useEffect(() => {
    if (!isEducator) return;
    dispatch(fetchEducatorDashboard()).then((result) => {
      if (fetchEducatorDashboard.rejected.match(result)) {
        toast.error(result.payload || "Failed to load dashboard");
      }
    });
  }, [dispatch, isEducator]);

  const chartData = useMemo(() => {
    const enrollments = dashboardData?.enrolledStudentsData || [];
    const courseCounts = enrollments.reduce((counts, item) => {
      counts[item.courseTitle] = (counts[item.courseTitle] || 0) + 1;
      return counts;
    }, {});

    const courseBars = Object.entries(courseCounts)
      .map(([label, value]) => ({ label, value }))
      .sort((first, second) => second.value - first.value)
      .slice(0, 5);

    const totalCourses = dashboardData?.totalCourses || 0;
    const activeCourses = courseBars.length;
    const emptyCourses = Math.max(totalCourses - activeCourses, 0);
    const activePercentage = totalCourses ? Math.round((activeCourses / totalCourses) * 100) : 0;

    return {
      courseBars,
      activeCourses,
      emptyCourses,
      activePercentage,
      latestEnrollments: enrollments.slice(-6).reverse(),
    };
  }, [dashboardData]);

  const maxBarValue = Math.max(...chartData.courseBars.map((item) => item.value), 1);
  const pieStyle = {
    background: `conic-gradient(#4f46e5 0 ${chartData.activePercentage}%, #e5e7eb ${chartData.activePercentage}% 100%)`,
  };

  return dashboardData ? (
    <>
      <div className="min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0">
        <div className="space-y-5 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-center w-full">
            <div className="flex items-center gap-3 shadow-card border border-blue-500 p-4 w-full rounded-md">
              <img src={assets.patients_icon} alt="patients_icon" />
              <div><p className="text-2xl font-medium text-gray-600">{dashboardData.enrolledStudentsData.length}</p><p className="text-base text-gray-500">Total Enrollments</p></div>
            </div>
            <div className="flex items-center gap-3 shadow-card border border-blue-500 p-4 w-full rounded-md">
              <img src={assets.appointments_icon} alt="appointments_icon" />
              <div><p className="text-2xl font-medium text-gray-600">{dashboardData.totalCourses}</p><p className="text-base text-gray-500">Total Courses</p></div>
            </div>
            <div className="flex items-center gap-3 shadow-card border border-blue-500 p-4 w-full rounded-md">
              <img src={assets.earning_icon} alt="earning_icon" />
              <div className="whitespace-nowrap"><p className="text-2xl font-medium text-gray-600 text-nowrap">{currency}{dashboardData.totalEarnings}</p><p className="text-base text-gray-500">Total Earnings</p></div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 w-full">
            <div className="bg-white border border-gray-500/20 rounded-md p-5">
              <h2 className="text-lg font-medium text-gray-800">Course Enrollment Bar Chart</h2>
              <div className="mt-6 h-72 flex items-end gap-4 border-l border-b border-gray-200 px-4 pt-4">
                {chartData.courseBars.length === 0 ? (
                  <p className="w-full self-center text-center text-gray-500">No enrollment data yet.</p>
                ) : (
                  chartData.courseBars.map((item) => {
                    const height = Math.max((item.value / maxBarValue) * 100, 8);

                    return (
                      <div key={item.label} className="flex-1 min-w-0 h-full flex flex-col items-center justify-end">
                        <span className="text-sm font-semibold text-gray-700 mb-2">{item.value}</span>
                        <div className="w-full max-w-16 h-48 flex items-end">
                          <div className="w-full rounded-t-md bg-indigo-600" style={{ height: `${height}%` }} />
                        </div>
                        <span className="mt-3 text-xs text-gray-500 text-center truncate w-full" title={item.label}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-500/20 rounded-md p-5">
              <h2 className="text-lg font-medium text-gray-800">Course Activity Pie Chart</h2>
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-8">
                <div className="h-44 w-44 rounded-full p-5" style={pieStyle}>
                  <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-800">{chartData.activePercentage}%</p>
                      <p className="text-xs text-gray-500">Active</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 text-sm w-full">
                  <div className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2">
                    <span className="flex items-center gap-2 text-gray-600">
                      <span className="h-3 w-3 rounded-full bg-indigo-600" /> Courses with enrollments
                    </span>
                    <span className="font-semibold text-gray-800">{chartData.activeCourses}</span>
                  </div>
                  <div className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2">
                    <span className="flex items-center gap-2 text-gray-600">
                      <span className="h-3 w-3 rounded-full bg-gray-200" /> Courses without enrollments
                    </span>
                    <span className="font-semibold text-gray-800">{chartData.emptyCourses}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 w-full mb-10">
            <h2 className="pb-4 text-lg font-medium">Latest Enrollments</h2>
            <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20 mb-10">
              <div className="w-full overflow-x-auto">
                <table className="table-fixed md:table-auto w-full overflow-hidden">
                  <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                    <tr><th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">#</th><th className="px-4 py-3 font-semibold">Student Name</th><th className="px-4 py-3 font-semibold">Course Title</th></tr>
                  </thead>
                  <tbody className="text-sm text-gray-500">
                    {chartData.latestEnrollments.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-4 py-6 text-center text-gray-500">
                          No enrollments yet.
                        </td>
                      </tr>
                    ) : (
                      chartData.latestEnrollments.map((item, index) => (
                        <tr key={`${item.student?._id || item.student?.email || index}-${item.courseTitle}`} className="border-b border-gray-500/20">
                          <td className="px-4 py-3 text-center hidden sm:table-cell">{index + 1}</td>
                          <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
                            <img src={item.student?.imageUrl || assets.profile_img} alt="student" className="w-9 h-9 rounded-full" />
                            <span className="truncate">{item.student?.name || "Student"}</span>
                          </td>
                          <td className="px-4 py-3 truncate">{item.courseTitle}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : <Loading />;
};

export default Dashboard;
