import express from "express";
import {
  adminLogin,
  approveInstructor,
  blockUser,
  changeAdminPassword,
  deleteUser,
  getAdminProfile,
  getAllUsers,
  getPendingInstructors,
  rejectInstructor,
  unblockUser,
} from "../controllers/adminController.js";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js";

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);
adminRouter.get("/profile", authenticate, authorizeRoles("admin"), getAdminProfile);
adminRouter.patch("/profile/password", authenticate, authorizeRoles("admin"), changeAdminPassword);
adminRouter.get("/instructors/pending", authenticate, authorizeRoles("admin"), getPendingInstructors);
adminRouter.patch("/instructors/:id/approve", authenticate, authorizeRoles("admin"), approveInstructor);
adminRouter.patch("/instructors/:id/reject", authenticate, authorizeRoles("admin"), rejectInstructor);
adminRouter.get("/users", authenticate, authorizeRoles("admin"), getAllUsers);
adminRouter.patch("/users/:id/block", authenticate, authorizeRoles("admin"), blockUser);
adminRouter.patch("/users/:id/unblock", authenticate, authorizeRoles("admin"), unblockUser);
adminRouter.delete("/users/:id", authenticate, authorizeRoles("admin"), deleteUser);

export default adminRouter;
