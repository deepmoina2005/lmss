import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import Footer from "../../components/student/Footer";
import Rating from "../../components/student/Rating";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";
import { useDispatch, useSelector } from "react-redux";
import { calculateChapterTime } from "../../redux/service/courseUtils";
import { addCourseRating, fetchCourseProgress, fetchEnrolledCourses, updateCourseProgress } from "../../redux/slice/learningSlice";

const Player = () => {
  const dispatch = useDispatch();
  const { enrolledCourses, progressByCourse } = useSelector((state) => state.learning);
  const userData = useSelector((state) => state.auth.user);
  const { courseId } = useParams();

  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  const progressData = progressByCourse[courseId] || null;

  useEffect(() => {
    dispatch(fetchEnrolledCourses());
  }, [dispatch]);

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      const selected = enrolledCourses.find((course) => course._id === courseId);
      if (selected) {
        setCourseData(selected);
        const myRating = selected.courseRatings.find((item) => item.userId === userData?._id);
        setInitialRating(myRating?.rating || 0);
      }
    }
  }, [enrolledCourses, courseId, userData]);

  useEffect(() => {
    dispatch(fetchCourseProgress(courseId));
  }, [dispatch, courseId]);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const markLectureAsCompleted = async (lectureId) => {
    const result = await dispatch(updateCourseProgress({ courseId, lectureId }));
    if (updateCourseProgress.fulfilled.match(result)) {
      toast.success("Progress Updated");
      dispatch(fetchCourseProgress(courseId));
    } else {
      toast.error(result.payload || "Unable to update progress");
    }
  };

  const handleRate = async (rating) => {
    const result = await dispatch(addCourseRating({ courseId, rating }));
    if (addCourseRating.fulfilled.match(result)) {
      toast.success(result.payload || "Rating Added");
      dispatch(fetchEnrolledCourses());
    } else {
      toast.error(result.payload || "Unable to add rating");
    }
  };

  const getFirstLecture = () => {
    if (!courseData) return null;
    for (let i = 0; i < courseData.courseContent.length; i++) {
      const chapter = courseData.courseContent[i];
      if (chapter.chapterContent && chapter.chapterContent.length > 0) {
        const lecture = chapter.chapterContent[0];
        return { ...lecture, chapter: i + 1, lecture: 1 };
      }
    }
    return null;
  };

  const handleThumbnailClick = () => {
    const first = getFirstLecture();
    if (first) {
      setPlayerData(first);
    } else {
      toast.info("No lectures available to play.");
    }
  };

  useEffect(() => {
    setIsLoadingVideo(Boolean(playerData));
  }, [playerData]);

  return courseData ? (
    <>
      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold">Course Structure</h2>
          <div className="pt-5">
            {courseData.courseContent.map((chapter, index) => (
              <div className="border border-gray-00 bg-white mb-2 rounded" key={index}>
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
                        <img
                          onClick={() => setPlayerData({ ...lecture, chapter: index + 1, lecture: i + 1 })}
                          className="w-4 h-4 mt-1 cursor-pointer"
                          src={progressData && progressData.lectureCompleted?.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon}
                          alt="play_icon"
                        />
                        <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                          <p>{lecture.lectureTitle}</p>
                          <div className="flex gap-2">
                            {lecture.lectureUrl && (
                              <p onClick={() => setPlayerData({ ...lecture, chapter: index + 1, lecture: i + 1 })} className="text-blue-500 cursor-pointer">
                                Watch
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

          <div className="flex items-center gap-2 py-3 mt-10 ">
            <h1 className="text-xl font-bold">Rate this Course:</h1>
            <Rating initialRating={initialRating} onRate={handleRate} />
          </div>
        </div>

        <div className="md:mt-10">
          {playerData ? (
            <div className="relative">
              {isLoadingVideo && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30">
                  <Loading />
                </div>
              )}

              <video
                src={playerData.lectureUrl}
                controls
                autoPlay
                onCanPlay={() => setIsLoadingVideo(false)}
                onWaiting={() => setIsLoadingVideo(true)}
                className="w-full aspect-video bg-black"
              />

              <div className="flex justify-between items-center mt-1">
                <p>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle} </p>
                <button onClick={() => markLectureAsCompleted(playerData.lectureId)} className="text-blue-600">
                  {progressData && progressData.lectureCompleted?.includes(playerData.lectureId) ? "Completed" : "Mark As Complete"}
                </button>
              </div>
            </div>
          ) : (
            <div className="relative cursor-pointer select-none" onClick={handleThumbnailClick}>
              <img src={courseData.courseThumbnail} alt="courseThumbnail" className="w-full object-cover aspect-video rounded" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 shadow-xl transform transition-transform duration-300 hover:shadow-2xl cursor-pointer">
                  <img src={assets.play_icon} alt="play_overlay" className="w-8 h-8 transform transition-transform duration-300 hover:scale-110" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default Player;
