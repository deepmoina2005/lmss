import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

const buildAuthResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  imageUrl: user.imageUrl || "",
  created_at: user.createdAt,
});

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "name, email, password and role are required" });
    }

    if (!["student", "instructor"].includes(role)) {
      return res.status(400).json({ success: false, message: "Only student or instructor can register" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const status = role === "instructor" ? "pending" : "approved";

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      status,
    });

    const message =
      role === "instructor"
        ? "Registration successful. Wait for admin approval before login."
        : "Registration successful.";

    return res.status(201).json({
      success: true,
      message,
      user: buildAuthResponse(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Use /api/admin/login for admin" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ success: false, message: "Your account is blocked. Contact support." });
    }

    if (user.role === "instructor" && user.status !== "approved") {
      return res
        .status(403)
        .json({ success: false, message: `Instructor login blocked. Current status: ${user.status}` });
    }

    const token = generateToken({ id: user._id.toString(), role: user.role });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: buildAuthResponse(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  return res.status(200).json({ success: true, message: "Logout successful. Remove token on client side." });
};

export const verifyAuthToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role status imageUrl createdAt");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        imageUrl: user.imageUrl || "",
        created_at: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
