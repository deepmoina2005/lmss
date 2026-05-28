import User from "../models/User.js";

export const requireApprovedInstructor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("role status");

    if (!user || user.role !== "instructor") {
      return res.status(403).json({ success: false, message: "Only instructor can access this route" });
    }

    if (user.status !== "approved") {
      return res.status(403).json({ success: false, message: `Instructor account is ${user.status}` });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
