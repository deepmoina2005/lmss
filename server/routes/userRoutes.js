import express from "express";
import {
  addUserRating,
  changeUserPassword,
  confirmPurchase,
  getMyCourseDoubts,
  getUserCourseProgress,
  getUserData,
  purchaseCourse,
  submitCourseDoubt,
  updateUserProfile,
  updateUserCourseProgress,
  userEnrolledCourses,
} from "../controllers/userController.js";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js";
import upload from "../configs/multer.js";

const userRouter = express.Router();

userRouter.get("/data", authenticate, authorizeRoles("student", "instructor"), getUserData);
userRouter.put(
  "/update-profile",
  authenticate,
  authorizeRoles("student", "instructor"),
  upload.single("image"),
  updateUserProfile
);
userRouter.post(
  "/change-password",
  authenticate,
  authorizeRoles("student", "instructor"),
  changeUserPassword
);
userRouter.get("/enrolled-courses", authenticate, authorizeRoles("student", "instructor"), userEnrolledCourses);
userRouter.post("/purchase", authenticate, authorizeRoles("student", "instructor"), purchaseCourse);
userRouter.post("/confirm-purchase", authenticate, authorizeRoles("student", "instructor"), confirmPurchase);
userRouter.post(
  "/update-course-progress",
  authenticate,
  authorizeRoles("student", "instructor"),
  updateUserCourseProgress
);
userRouter.post("/get-course-progress", authenticate, authorizeRoles("student", "instructor"), getUserCourseProgress);
userRouter.post("/add-rating", authenticate, authorizeRoles("student", "instructor"), addUserRating);
userRouter.post("/doubts", authenticate, authorizeRoles("student", "instructor"), submitCourseDoubt);
userRouter.get("/doubts/:courseId", authenticate, authorizeRoles("student", "instructor"), getMyCourseDoubts);

export default userRouter;
