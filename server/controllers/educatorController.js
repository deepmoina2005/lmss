import Course from "../models/Course.js";
import { CourseProgress } from "../models/CourseProgress.js";
import Doubt from "../models/Doubt.js";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";

export const requestInstructorRole = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "instructor") {
      return res.json({ success: true, message: `Instructor request already ${user.status}` });
    }

    user.role = "instructor";
    user.status = "pending";
    await user.save();

    return res.json({ success: true, message: "Instructor request submitted for admin approval" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const files = req.files || [];
    const imageFile = files.find((f) => f.fieldname === "image");
    const educatorId = req.user.id;

    if (!imageFile) {
      return res.status(400).json({ success: false, message: "Thumbnail not attached" });
    }

    const parsedCourseData = JSON.parse(courseData);
    parsedCourseData.educator = educatorId;

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    parsedCourseData.courseThumbnail = `${baseUrl}/uploads/${imageFile.filename}`;

    // Bind uploaded lecture videos to corresponding lecture by lectureId.
    for (const chapter of parsedCourseData.courseContent || []) {
      for (const lecture of chapter.chapterContent || []) {
        const videoFieldName = `lecture_video_${lecture.lectureId}`;
        const lectureVideoFile = files.find((f) => f.fieldname === videoFieldName);
        if (!lectureVideoFile) {
          return res.status(400).json({
            success: false,
            message: `Missing video file for lecture: ${lecture.lectureTitle}`,
          });
        }
        lecture.lectureUrl = `${baseUrl}/uploads/${lectureVideoFile.filename}`;
      }
    }

    const newCourse = await Course.create(parsedCourseData);

    return res.status(201).json({ success: true, message: "Course added", course: newCourse });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getEducatorCourses = async (req, res) => {
  try {
    const educator = req.user.id;
    const courses = await Course.find({ educator });
    return res.json({ success: true, courses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEducatorCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const educator = req.user.id;
    const { courseData } = req.body;
    const files = req.files || [];
    const imageFile = files.find((file) => file.fieldname === "image");

    if (!courseData) {
      return res.status(400).json({ success: false, message: "courseData is required" });
    }

    const course = await Course.findOne({ _id: id, educator });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const parsedCourseData = JSON.parse(courseData);

    course.courseTitle = parsedCourseData.courseTitle;
    course.courseDescription = parsedCourseData.courseDescription;
    course.coursePrice = Number(parsedCourseData.coursePrice);
    course.discount = Number(parsedCourseData.discount);
    course.isPublished = Boolean(parsedCourseData.isPublished);

    if (Array.isArray(parsedCourseData.courseContent)) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      course.courseContent = parsedCourseData.courseContent.map((chapter, chapterIndex) => ({
        chapterId: chapter.chapterId,
        chapterOrder: chapter.chapterOrder || chapterIndex + 1,
        chapterTitle: chapter.chapterTitle,
        chapterContent: (chapter.chapterContent || []).map((lecture, lectureIndex) => {
          const videoFieldName = `lecture_video_${lecture.lectureId}`;
          const lectureVideoFile = files.find((file) => file.fieldname === videoFieldName);
          const lectureUrl = lectureVideoFile ? `${baseUrl}/uploads/${lectureVideoFile.filename}` : lecture.lectureUrl;

          if (!lectureUrl) {
            throw new Error(`Missing video file for lecture: ${lecture.lectureTitle}`);
          }

          return {
            lectureId: lecture.lectureId,
            lectureTitle: lecture.lectureTitle,
            lectureDuration: Number(lecture.lectureDuration),
            lectureUrl,
            isPreviewFree: Boolean(lecture.isPreviewFree),
            lectureOrder: lecture.lectureOrder || lectureIndex + 1,
          };
        }),
      }));
    }

    if (imageFile) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      course.courseThumbnail = `${baseUrl}/uploads/${imageFile.filename}`;
    }

    await course.save();

    return res.json({ success: true, message: "Course updated", course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEducatorCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const educator = req.user.id;
    const course = await Course.findOne({ _id: id, educator });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    await Purchase.deleteMany({ courseId: id });
    await CourseProgress.deleteMany({ courseId: id });
    await User.updateMany({}, { $pull: { enrolledCourses: id } });
    await Course.findByIdAndDelete(id);

    return res.json({ success: true, message: "Course deleted", id });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const educatorDashboardData = async (req, res) => {
  try {
    const educator = req.user.id;

    const courses = await Course.find({ educator });
    const totalCourses = courses.length;

    const courseIds = courses.map((course) => course._id);
    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    });

    const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0).toFixed(2);

    const enrolledStudentsData = [];
    for (const course of courses) {
      const students = await User.find({ _id: { $in: course.enrolledStudents } }, "name imageUrl email");
      students.forEach((student) => {
        enrolledStudentsData.push({
          courseTitle: course.courseTitle,
          student,
        });
      });
    }

    return res.json({
      success: true,
      dashboardData: {
        totalEarnings,
        enrolledStudentsData,
        totalCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educator = req.user.id;
    const courses = await Course.find({ educator });
    const courseIds = courses.map((course) => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl email")
      .populate("courseId", "courseTitle");

    const enrolledStudents = purchases.map((purchase) => ({
      student: purchase.userId,
      courseTitle: purchase.courseId.courseTitle,
      purchaseDate: purchase.createdAt,
    }));

    return res.json({ success: true, enrolledStudents });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInstructorDoubts = async (req, res) => {
  try {
    const instructor = req.user.id;
    const doubts = await Doubt.find({ instructor })
      .populate("student", "name email imageUrl")
      .populate("course", "courseTitle")
      .sort({ createdAt: -1 });

    return res.json({ success: true, doubts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const replyInstructorDoubt = async (req, res) => {
  try {
    const instructor = req.user.id;
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply?.trim()) {
      return res.status(400).json({ success: false, message: "Reply is required" });
    }

    const doubt = await Doubt.findOneAndUpdate(
      { _id: id, instructor },
      { reply: reply.trim(), status: "answered" },
      { new: true }
    )
      .populate("student", "name email imageUrl")
      .populate("course", "courseTitle");

    if (!doubt) {
      return res.status(404).json({ success: false, message: "Doubt not found" });
    }

    return res.json({ success: true, message: "Reply sent", doubt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
