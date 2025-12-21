import jwt from "jsonwebtoken";
import SuperAdmin from "../models/SuperAdmin.js";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Channel from "../models/Channel.js";
import { getTokenFromRequest } from "../utils/cookieUtils.js";

// Protect routes - Authentication
export const protect = async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user;

    // Check based on the role
    switch (decoded.role) {
      case "superadmin":
        user = await SuperAdmin.findById(decoded.id).select("-password");
        break;
      case "admin":
        user = await Admin.findById(decoded.id).select("-password");
        break;
      case "user":
        user = await User.findById(decoded.id).select("-password");
        break;
      default:
        return res.status(401).json({
          success: false,
          message: "Invalid role in token",
        });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user; // Attach the user to the request
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Authorize roles - Authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
