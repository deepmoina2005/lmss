import humanizeDuration from "humanize-duration";

export const calculateRating = (course) => {
  if (!course?.courseRatings?.length) return 0;
  const total = course.courseRatings.reduce((sum, item) => sum + item.rating, 0);
  return Math.floor(total / course.courseRatings.length);
};

export const calculateChapterTime = (chapter) => {
  const time = (chapter?.chapterContent || []).reduce(
    (sum, lecture) => sum + lecture.lectureDuration,
    0
  );
  return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
};

export const calculateCourseDuration = (course) => {
  let time = 0;
  (course?.courseContent || []).forEach((chapter) => {
    (chapter.chapterContent || []).forEach((lecture) => {
      time += lecture.lectureDuration;
    });
  });
  return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
};

export const calculateNoOfLectures = (course) => {
  let totalLectures = 0;
  (course?.courseContent || []).forEach((chapter) => {
    if (Array.isArray(chapter.chapterContent)) {
      totalLectures += chapter.chapterContent.length;
    }
  });
  return totalLectures;
};