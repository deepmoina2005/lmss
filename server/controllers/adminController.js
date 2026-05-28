import bcrypt from "bcryptjs";
import User from "../models/User.js";
import AdminSetting from "../models/AdminSetting.js";
import Course from "../models/Course.js";
import { CourseProgress } from "../models/CourseProgress.js";
import { Purchase } from "../models/Purchase.js";
import { generateToken } from "../utils/jwt.js";

const getSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  created_at: user.createdAt,
});

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password are required" });
    }

    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    const adminSetting = await AdminSetting.findOne({ key: "admin-password" });
    const isPasswordValid = adminSetting
      ? await bcrypt.compare(password, adminSetting.passwordHash)
      : password === process.env.ADMIN_PASSWORD;

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    const token = generateToken({ id: "env-admin", role: "admin" });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: { email: process.env.ADMIN_EMAIL, role: "admin" },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const changeAdminPassword = async (req, res) => {
  try {
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

    const adminSetting = await AdminSetting.findOne({ key: "admin-password" });
    const isCurrentPasswordValid = adminSetting
      ? await bcrypt.compare(currentPassword, adminSetting.passwordHash)
      : currentPassword === process.env.ADMIN_PASSWORD;

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: "New password must be different from current password" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await AdminSetting.findOneAndUpdate(
      { key: "admin-password" },
      { passwordHash },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      admin: { email: process.env.ADMIN_EMAIL || "" },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: "instructor", status: "pending" }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, instructors: instructors.map(getSafeUser) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await User.findOneAndUpdate(
      { _id: id, role: "instructor" },
      { status: "approved" },
      { new: true }
    );

    if (!instructor) {
      return res.status(404).json({ success: false, message: "Instructor not found" });
    }

    return res.status(200).json({ success: true, message: "Instructor approved", instructor: getSafeUser(instructor) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await User.findOneAndUpdate(
      { _id: id, role: "instructor" },
      { status: "rejected" },
      { new: true }
    );

    if (!instructor) {
      return res.status(404).json({ success: false, message: "Instructor not found" });
    }

    return res.status(200).json({ success: true, message: "Instructor rejected", instructor: getSafeUser(instructor) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users: users.map(getSafeUser) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { status: "blocked" }, { new: true });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User blocked", user: getSafeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.status = "approved";
    await user.save();

    return res.status(200).json({ success: true, message: "User unblocked", user: getSafeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const educatorCourses = await Course.find({ educator: id }).select("_id");
    const educatorCourseIds = educatorCourses.map((course) => course._id);

    await Course.updateMany(
      {},
      {
        $pull: {
          enrolledStudents: id,
          courseRatings: { userId: id },
        },
      }
    );

    if (educatorCourseIds.length > 0) {
      await Course.deleteMany({ _id: { $in: educatorCourseIds } });
      await User.updateMany({}, { $pull: { enrolledCourses: { $in: educatorCourseIds } } });
    }

    await Purchase.deleteMany({
      $or: [{ userId: id }, { courseId: { $in: educatorCourseIds } }],
    });
    await CourseProgress.deleteMany({
      $or: [{ userId: id }, { courseId: { $in: educatorCourseIds } }],
    });
    await User.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
