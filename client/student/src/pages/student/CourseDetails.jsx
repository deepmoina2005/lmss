import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../../components/student/Loading";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import Footer from "../../components/student/Footer";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { calculateChapterTime, calculateCourseDuration, calculateNoOfLectures, calculateRating } from "../../redux/service/courseUtils";
import { fetchCourseById, purchaseCourse } from "../../redux/slice/courseSlice";
import { fetchCourseDoubts, submitCourseDoubt } from "../../redux/slice/learningSlice";

const CourseDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const [openSections, setOpenSections] = useState({});
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [doubtQuestion, setDoubtQuestion] = useState("");
  const [doubtLoading, setDoubtLoading] = useState(false);

  const courseData = useSelector((state) => state.course.currentCourse);
  const currency = useSelector((state) => state.course.currency);
  const userData = useSelector((state) => state.auth.user);
  const enrolledCourses = useSelector((state) => state.learning.enrolledCourses);
  const courseDoubts = useSelector((state) => state.learning.doubtsByCourse[id] || []);

  const enrollCourse = async () => {
    try {
      if (!userData) {
        return toast.warn("Login to Enroll!");
      }
      if (isAlreadyEnrolled) {
        return toast.warn("Already Enrolled");
      }

      const result = await dispatch(purchaseCourse(courseData._id));
      if (purchaseCourse.fulfilled.match(result)) {
        window.location.replace(result.payload);
      } else {
        toast.error(result.payload || "Purchase failed");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    dispatch(fetchCourseById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (userData && courseData) {
      setIsAlreadyEnrolled(enrolledCourses.some((c) => c._id === courseData._id));
    }
  }, [userData, courseData, enrolledCourses]);

  useEffect(() => {
    if (userData && courseData?._id) {
      dispatch(fetchCourseDoubts(courseData._id));
    }
  }, [dispatch, userData, courseData?._id]);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleDoubtSubmit = async (event) => {
    event.preventDefault();

    if (!userData) {
      toast.warn("Login to ask a doubt");
      return;
    }

    if (!doubtQuestion.trim()) {
      toast.error("Please write your doubt");
      return;
    }

    setDoubtLoading(true);
    const result = await dispatch(submitCourseDoubt({ courseId: courseData._id, question: doubtQuestion }));

    if (submitCourseDoubt.fulfilled.match(result)) {
      toast.success(result.payload);
      setDoubtQuestion("");
      dispatch(fetchCourseDoubts(courseData._id));
    } else {
      toast.error(result.payload || "Failed to send doubt");
    }

    setDoubtLoading(false);
  };

  return courseData ? (
    <>
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:placeholder-teal-300 pt-20 text-left">
        <div className="absolute top-0 left-0 w-full h-section-height -z-1 bg-gradient-to-b from-cyan-100/70"></div>

        <div className="max-w-xl z-10 text-gray-500">
          <h1 className="md:text-course-details-heading-large text-course-details-heading-small font-semibold text-gray-800">
            {courseData.courseTitle}
          </h1>
          <p className="pt-4 md:text-base text-sm" dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }}></p>

          <div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
            <p>{calculateRating(courseData)}</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <img className="w-3.5 h-3.5" key={i} src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank} alt="star" />
              ))}
            </div>
            <p className="text-blue-600">({courseData.courseRatings.length} {courseData.courseRatings.length > 1 ? "ratings" : "rating"})</p>
            <p>{courseData.enrolledStudents.length} {courseData.enrolledStudents.length > 1 ? "students" : "student"}</p>
          </div>
          <p className="text-sm">Course by <span className="text-blue-600 underline">{courseData.educator.name}</span></p>

          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">Course Structure</h2>
            <div className="pt-5">
              {courseData.courseContent.map((chapter, index) => (
                <div className="border border-gray-300 bg-white mb-2 rounded" key={index}>
                  <div className="flex items-center justify-between px-4 py-3 cursor-pointer select-none" onClick={() => toggleSection(index)}>
                    <div className="flex items-center gap-2">
                      <img className={`transform transition-transform ${openSections[index] ? "rotate-180" : ""}`} src={assets.down_arrow_icon} alt="down_arrow_icon" />
                      <p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
                    </div>
                    <p className="text-sm md:text-default">{chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)} </p>
                  </div>

                  <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? "max-h-9g" : "max-h-0"}`}>
                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className="flex items-start gap-2 py-1">
                          {lecture.isPreviewFree ? (
                            <img onClick={() => setPlayerData({ lectureUrl: lecture.lectureUrl })} className="w-4 h-4 mt-1 cursor-pointer" src={assets.play_icon} alt="play_icon" />
                          ) : (
                            <img className="w-4 h-4 mt-1" src={assets.play_icon} alt="play_icon" />
                          )}

                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                            <p>{lecture.lectureTitle}</p>
                            <div className="flex gap-2">
                              {lecture.isPreviewFree && (
                                <p onClick={() => setPlayerData({ lectureUrl: lecture.lectureUrl })} className="text-blue-500 cursor-pointer">
                                  Preview
                                </p>
                              )}
                              <p>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ["h", "m"] })}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="py-20 text-sm md:text-default">
            <h3 className="text-xl font-semibold text-gray-800 ">Course Description</h3>
            <p className="pt-3 rich-text" dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}></p>
          </div>

          <div className="pb-16 text-sm md:text-default">
            <h3 className="text-xl font-semibold text-gray-800">Ask a Doubt</h3>
            <form onSubmit={handleDoubtSubmit} className="mt-4 bg-white border border-gray-300 rounded p-4">
              <textarea
                value={doubtQuestion}
                onChange={(event) => setDoubtQuestion(event.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your question for the instructor..."
              />
              <button
                type="submit"
                disabled={doubtLoading}
                className="mt-3 px-5 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {doubtLoading ? "Sending..." : "Send Doubt"}
              </button>
            </form>

            {userData && (
              <div className="mt-5 bg-white border border-gray-300 rounded p-4">
                <h4 className="font-semibold text-gray-800">Your Doubts & Replies</h4>
                {courseDoubts.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-500">No doubts asked yet.</p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {courseDoubts.map((doubt) => (
                      <div key={doubt._id} className="border border-gray-200 rounded p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-gray-800">Q: {doubt.question}</p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${doubt.status === "answered" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {doubt.status}
                          </span>
                        </div>
                        {doubt.reply ? (
                          <div className="mt-3 bg-blue-50 border border-blue-100 rounded p-3">
                            <p className="text-sm font-medium text-blue-800">Instructor Reply</p>
                            <p className="mt-1 text-sm text-blue-700">{doubt.reply}</p>
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-gray-500">Instructor has not replied yet.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
          {playerData ? (
            <video src={playerData.lectureUrl} controls autoPlay className="w-full aspect-video bg-black" />
          ) : (
            <img src={courseData.courseThumbnail} alt="courseThumbnail" />
          )}

          <div className="p-5">
            <div className="flex items-center gap-2">
              <img className="w-3.5" src={assets.time_left_clock_icon} alt="time_left_clock_icon" />
              <p className="text-red-500"><span className="font-medium">5 days</span> left at this price!</p>
            </div>

            <div className="flex gap-3 items-center pt-2">
              <p className="text-gray-800 md:text-4xl text-2xl font-semibold">{currency} {(courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2)}</p>
              <p className="md:text-lg text-gray-500 line-through">{currency} {courseData.coursePrice} </p>
              <p className="md:text-lg text-gray-500">{currency} {courseData.discount}% off </p>
            </div>

            <div className="flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500">
              <div className="flex items-center gap-1"><img src={assets.star} alt="star icon" /><p>{calculateRating(courseData)}</p></div>
              <div className="h-4 w-px bg-gray-500/40"></div>
              <div className="flex items-center gap-1"><img src={assets.time_clock_icon} alt="time_clock_icon" /><p>{calculateCourseDuration(courseData)}</p></div>
              <div className="h-4 w-px bg-gray-500/40"></div>
              <div className="flex items-center gap-1"><img src={assets.lesson_icon} alt="lesson_icon" /><p>{calculateNoOfLectures(courseData)} lessons</p></div>
            </div>

            <div>
              {isAlreadyEnrolled ? (
                <p className="md:mt-6 mt-4 w-full py-3 rounded text-center  bg-blue-600 text-white font-medium"> Already Enrolled </p>
              ) : courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100 === 0.0 ? (
                <p className="md:mt-6 mt-4 w-full py-3 rounded text-center  bg-blue-600 text-white font-medium"> Free </p>
              ) : (
                <button onClick={enrollCourse} className="md:mt-6 mt-4 w-full py-3 rounded text-center  bg-blue-600 text-white font-medium"> Enroll Now</button>
              )}
            </div>

            <div>
              {courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100 === 0.0 ? (
                <p className="md:mt-6 mt-4 w-full text-center py-3 rounded  bg-blue-600 text-white font-medium">Click on Course structure </p>
              ) : isAlreadyEnrolled ? (
                <Link to="/my-enrollments"><p className="md:mt-6 mt-4 w-full text-center py-3 rounded  bg-blue-600 text-white font-medium">My Enrollments</p> </Link>
              ) : (
                ""
              )}
            </div>

            <div className="pt-6">
              <p className="md:text-xl text-lg font-medium text-gray-800">What's in the course? </p>
              <ul className="ml-4 pt-2 text-sm md:text-default list-disc text-gray-500">
                <li>Lifetime access with free updates.</li>
                <li>Step-by-step, hands-on project guidance.</li>
                <li>Downloadable resources and source code.</li>
                <li>Quizzes to test your knowledge.</li>
                <li>Certificate of completion.</li>
                <li>Quizzes to test your knowledge.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default CourseDetails;
