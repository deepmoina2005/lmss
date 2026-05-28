import express from "express";

import {
  addCourse,
  deleteEducatorCourse,
  educatorDashboardData,
  getEducatorCourses,
  getEnrolledStudentsData,
  getInstructorDoubts,
  requestInstructorRole,
  replyInstructorDoubt,
  updateEducatorCourse,
} from "../controllers/educatorController.js";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js";
import { requireApprovedInstructor } from "../middlewares/instructorMiddleware.js";
import upload from "../configs/multer.js";

const educatorRouter = express.Router();

educatorRouter.get("/update-role", authenticate, requestInstructorRole);
educatorRouter.post(
  "/add-course",
  authenticate,
  authorizeRoles("instructor"),
  requireApprovedInstructor,
  upload.any(),
  addCourse
);
educatorRouter.get("/courses", authenticate, authorizeRoles("instructor"), requireApprovedInstructor, getEducatorCourses);
educatorRouter.patch(
  "/courses/:id",
  authenticate,
  authorizeRoles("instructor"),
  requireApprovedInstructor,
  upload.any(),
  updateEducatorCourse
);
educatorRouter.delete(
  "/courses/:id",
  authenticate,
  authorizeRoles("instructor"),
  requireApprovedInstructor,
  deleteEducatorCourse
);
educatorRouter.get("/dashboard", authenticate, authorizeRoles("instructor"), requireApprovedInstructor, educatorDashboardData);
educatorRouter.get(
  "/enrolled-students",
  authenticate,
  authorizeRoles("instructor"),
  requireApprovedInstructor,
  getEnrolledStudentsData
);
educatorRouter.get("/doubts", authenticate, authorizeRoles("instructor"), requireApprovedInstructor, getInstructorDoubts);
educatorRouter.patch(
  "/doubts/:id/reply",
  authenticate,
  authorizeRoles("instructor"),
  requireApprovedInstructor,
  replyInstructorDoubt
);

export default educatorRouter;
