import Course from "../models/Course.js";

export const getAllCourse = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .select(["-courseContent", "-enrolledStudents"])
      .populate({ path: "educator", select: "name email" });

    return res.json({ success: true, courses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseId = async (req, res) => {
  const { id } = req.params;
  try {
    const courseData = await Course.findById(id).populate({ path: "educator", select: "name email" });

    if (!courseData) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    courseData.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        if (!lecture.isPreviewFree) {
          lecture.lectureUrl = "";
        }
      });
    });

    return res.json({ success: true, courseData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
