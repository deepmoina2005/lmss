import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: token missing" });
    }

    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    if (decoded.role !== "admin") {
      const user = await User.findById(decoded.id).select("status");

      if (!user) {
        return res.status(401).json({ success: false, message: "Unauthorized: user not found" });
      }

      if (user.status === "blocked") {
        return res.status(403).json({ success: false, message: "Account is blocked" });
      }
    }

    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized: invalid token" });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: insufficient permissions" });
    }
    return next();
  };
};
