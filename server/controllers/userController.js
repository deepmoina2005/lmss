import Stripe from "stripe";
import bcrypt from "bcryptjs";
import Course from "../models/Course.js";
import Doubt from "../models/Doubt.js";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";
import { CourseProgress } from "../models/CourseProgress.js";

const finalizeEnrollment = async (purchaseId) => {
  const purchase = await Purchase.findById(purchaseId);
  if (!purchase) return null;

  const userData = await User.findById(purchase.userId);
  const courseData = await Course.findById(purchase.courseId);
  if (!userData || !courseData) return null;

  if (!courseData.enrolledStudents.some((id) => id.toString() === userData._id.toString())) {
    courseData.enrolledStudents.push(userData._id);
    await courseData.save();
  }

  if (!userData.enrolledCourses.some((id) => id.toString() === courseData._id.toString())) {
    userData.enrolledCourses.push(courseData._id);
    await userData.save();
  }

  purchase.status = "completed";
  await purchase.save();

  return purchase;
};

export const getUserData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("name email role status enrolledCourses imageUrl createdAt");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const updates = {};
    if (typeof name === "string") {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return res.status(400).json({ success: false, message: "Name cannot be empty" });
      }
      updates.name = trimmedName;
    }

    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      updates.imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No profile field provided for update" });
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select(
      "name email role status enrolledCourses imageUrl createdAt"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All password fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "New password and confirm password do not match" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ success: false, message: "New password must be different from current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = await User.findById(userId).populate("enrolledCourses");

    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, enrolledCourses: userData.enrolledCourses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }

    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      return res.status(404).json({ success: false, message: "Data not found" });
    }

    if (userData.enrolledCourses.some((id) => id.toString() === courseId)) {
      return res.status(400).json({ success: false, message: "Already enrolled in this course" });
    }

    const amount = Number((courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2));

    const purchase = await Purchase.create({
      courseId: courseData._id,
      userId,
      amount,
      status: amount <= 0 ? "completed" : "pending",
    });

    if (amount <= 0) {
      await finalizeEnrollment(purchase._id);
      return res.json({
        success: true,
        message: "Enrolled successfully",
        session_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/my-enrollments`,
      });
    }

    if (!process.env.STRIPE_SECRET_KEY || !process.env.CURRENCY) {
      return res.status(400).json({
        success: false,
        message: "Stripe is not configured. Set STRIPE_SECRET_KEY and CURRENCY in server .env",
      });
    }

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = process.env.CURRENCY.toLowerCase();

    const line_items = [
      {
        price_data: {
          currency,
          product_data: { name: courseData.courseTitle },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ];

    const origin = req.headers.origin || process.env.CLIENT_URL || "http://localhost:5173";

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      line_items,
      mode: "payment",
      metadata: {
        purchaseId: purchase._id.toString(),
      },
    });

    return res.json({ success: true, session_url: session.url });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmPurchase = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "sessionId is required" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(400).json({ success: false, message: "Stripe is not configured" });
    }

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not completed yet" });
    }

    const purchaseId = session.metadata?.purchaseId;
    if (!purchaseId) {
      return res.status(400).json({ success: false, message: "Invalid purchase metadata" });
    }

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase || purchase.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized purchase confirmation" });
    }

    await finalizeEnrollment(purchaseId);
    return res.json({ success: true, message: "Purchase confirmed and enrollment updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, lectureId } = req.body;
    const progressData = await CourseProgress.findOne({ userId, courseId });

    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.json({ success: true, message: "Lecture already completed" });
      }

      progressData.lectureCompleted.push(lectureId);
      progressData.completed = true;
      await progressData.save();
    } else {
      await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId],
      });
    }

    return res.json({ success: true, message: "Progress updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;
    const progressData = await CourseProgress.findOne({ userId, courseId });
    return res.json({ success: true, progressData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addUserRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, rating } = req.body;

    if (!courseId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Invalid details" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const user = await User.findById(userId);

    if (!user || !user.enrolledCourses.some((id) => id.toString() === courseId)) {
      return res.status(403).json({ success: false, message: "User has not purchased this course" });
    }

    const existingRatingIndex = course.courseRatings.findIndex((r) => r.userId === userId.toString());
    if (existingRatingIndex > -1) {
      course.courseRatings[existingRatingIndex].rating = rating;
    } else {
      course.courseRatings.push({ userId: userId.toString(), rating });
    }

    await course.save();
    return res.json({ success: true, message: "Rating added" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitCourseDoubt = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, question } = req.body;

    if (!courseId || !question?.trim()) {
      return res.status(400).json({ success: false, message: "courseId and question are required" });
    }

    const course = await Course.findById(courseId).select("educator enrolledStudents coursePrice discount");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const isEnrolled = course.enrolledStudents.some((id) => id.toString() === userId);
    const isFree = course.coursePrice - (course.discount * course.coursePrice) / 100 <= 0;

    if (!isEnrolled && !isFree) {
      return res.status(403).json({ success: false, message: "Enroll in this course to ask doubts" });
    }

    const doubt = await Doubt.create({
      course: courseId,
      instructor: course.educator,
      student: userId,
      question: question.trim(),
    });

    return res.status(201).json({ success: true, message: "Doubt sent to instructor", doubt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyCourseDoubts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }

    const doubts = await Doubt.find({ student: userId, course: courseId })
      .populate("course", "courseTitle")
      .sort({ createdAt: -1 });

    return res.json({ success: true, doubts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
