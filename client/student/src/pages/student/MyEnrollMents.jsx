import { useEffect, useMemo } from "react";
import { Line } from "rc-progress";
import Footer from "../../components/student/Footer";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { calculateCourseDuration, calculateNoOfLectures } from "../../redux/service/courseUtils";
import { fetchCourseProgress, fetchEnrolledCourses } from "../../redux/slice/learningSlice";

const MyEnrollMents = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enrolledCourses, progressByCourse } = useSelector((state) => state.learning);
  const userData = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (userData) {
      dispatch(fetchEnrolledCourses());
    }
  }, [dispatch, userData]);

  useEffect(() => {
    enrolledCourses.forEach((course) => {
      dispatch(fetchCourseProgress(course._id));
    });
  }, [dispatch, enrolledCourses]);

  const progressArray = useMemo(
    () =>
      enrolledCourses.map((course) => {
        const progress = progressByCourse[course._id];
        return {
          totalLectures: calculateNoOfLectures(course),
          lectureCompleted: progress?.lectureCompleted?.length || 0,
        };
      }),
    [enrolledCourses, progressByCourse]
  );

  return (
    <>
      <div className="md:px-36 px-8 pt-10">
        <h1 className="text-2xl font-semibold">My EnrollMents</h1>
        <table className="md:table-auto table-fixed w-full overflow-hidden border mt-10">
          <thead className="text-gray-900 border-b border-gray-500/20  text-sm text-left max-sm:hidden">
            <tr>
              <th className="px-4 py-3 font-semibold truncate">Course</th>
              <th className="px-4 py-3 font-semibold truncate">Duration</th>
              <th className="px-4 py-3 font-semibold truncate">Completed</th>
              <th className="px-4 py-3 font-semibold truncate">Status</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {enrolledCourses.map((course, index) => (
              <tr className="border-b border-gray-500/20" key={index}>
                <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 ">
                  <img className="w-14 sm:w-24 md:w-28 cursor-pointer" onClick={() => navigate("/player/" + course._id)} src={course.courseThumbnail} alt="courseThumbnail" />
                  <div className="flex-1 cursor-pointer" onClick={() => navigate("/player/" + course._id)}>
                    <p className="mb-1 max-sm:text-sm">{course.courseTitle}</p>
                    <Line
                      strokeWidth={2}
                      percent={
                        progressArray[index]
                          ? (progressArray[index].lectureCompleted * 100) / progressArray[index].totalLectures
                          : 0
                      }
                      className="bg-gray-300 rounded-full"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 max-sm:hidden">{calculateCourseDuration(course)}</td>
                <td className="px-4 py-3 max-sm:hidden">
                  {progressArray[index] && `${progressArray[index].lectureCompleted} / ${progressArray[index].totalLectures} `} <span>Lectures</span>
                </td>
                <td className="px-3 py-3 max-sm:text-right">
                  <button className="px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 max-sm:text-xs text-white" onClick={() => navigate("/player/" + course._id)}>
                    {progressArray[index] && progressArray[index].lectureCompleted / progressArray[index].totalLectures === 1 ? "Completed" : "On Going"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  );
};

export default MyEnrollMents;
