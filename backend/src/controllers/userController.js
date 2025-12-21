import User from "../models/User.js";
import Admin from "../models/Admin.js";
import SuperAdmin from "../models/SuperAdmin.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";
import { getAvatarUrl } from "../utils/avatarGenerator.js";
import { setTokenCookie, clearTokenCookie } from "../utils/cookieUtils.js";
import { generateOTP, getOTPExpiry, sendOTPEmail } from "../utils/otp.js";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// @desc    Register User
// @route   POST /api/user/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Validation
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, password, and phoneNumber",
      });
    }

    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 50 characters",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // Phone validation using libphonenumber-js
    const parsedPhone = parsePhoneNumberFromString(phoneNumber);
    if (!parsedPhone || !parsedPhone.isValid()) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid international phone number (include country code, e.g. +1, +44, +962)",
      });
    }

    // Normalize before saving
    const normalizedPhone = parsedPhone.number;

    // Check for existing email or phoneNumber across all user types
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber: normalizedPhone }],
    });
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { phoneNumber: normalizedPhone }],
    });
    const existingSuperAdmin = await SuperAdmin.findOne({
      $or: [{ email }, { phoneNumber: normalizedPhone }],
    });

    if (existingUser || existingAdmin || existingSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number is already in use by another account",
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phoneNumber: normalizedPhone,
      image: getAvatarUrl({ name }),
    });

    // Handle image upload if provided
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "seagulls/users",
          width: 300,
          crop: "scale",
        });
        user.image = {
          public_id: result.public_id,
          url: result.secure_url,
        };
        await user.save();
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        if (req.file) fs.unlinkSync(req.file.path);
        console.error("Image upload error:", uploadError);
      }
    }

    // Save user if image not uploaded
    if (!req.file) await user.save();

    // Generate token
    const token = user.getJwtToken();

    // Set token in HTTP-only cookie
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
      token,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

// @desc    Login User
// @route   POST /api/user/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if the user isActive
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please contact support.",
      });
    }

    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = user.getJwtToken();

    // Set token in HTTP-only cookie
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

// @desc    Get Current User
// @route   GET /api/user/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

// @desc    Get all Users
// @route   GET /api/user
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// @desc    Update User Profile
// @route   PUT /api/user/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;
    const updateData = {};

    // Validation for provided fields
    if (name) {
      if (name.length < 2 || name.length > 50) {
        return res.status(400).json({
          success: false,
          message: "Name must be between 2 and 50 characters",
        });
      }
      updateData.name = name;
    }

    if (email) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email",
        });
      }
      updateData.email = email;
    }

    if (phoneNumber) {
      // Global validation with libphonenumber-js
      const parsedPhone = parsePhoneNumberFromString(phoneNumber);
      if (!parsedPhone || !parsedPhone.isValid()) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid international phone number (include country code, e.g. +1, +44, +962)",
        });
      }
      // Normalize before saving
      updateData.phoneNumber = parsedPhone.number;
    }

    // Check if email is being updated and if it already exists across all user types
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user.id },
      });
      const existingAdmin = await Admin.findOne({ email });
      const existingSuperAdmin = await SuperAdmin.findOne({ email });

      if (existingUser || existingAdmin || existingSuperAdmin) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use by another account",
        });
      }
    }

    if (phoneNumber) {
      // Prevent duplicate phone numbers across all user types
      const existingUser = await User.findOne({
        phoneNumber: updateData.phoneNumber,
        _id: { $ne: req.user.id },
      });
      const existingAdmin = await Admin.findOne({
        phoneNumber: updateData.phoneNumber,
      });
      const existingSuperAdmin = await SuperAdmin.findOne({
        phoneNumber: updateData.phoneNumber,
      });

      if (existingUser || existingAdmin || existingSuperAdmin) {
        return res.status(400).json({
          success: false,
          message: "Phone number is already in use by another account",
        });
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Handle image upload if provided
    if (req.file) {
      try {
        if (user.image && user.image.public_id) {
          await cloudinary.uploader.destroy(user.image.public_id);
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "seagulls/users",
          width: 300,
          crop: "scale",
        });

        user.image = {
          public_id: result.public_id,
          url: result.secure_url,
        };
        await user.save();

        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        if (req.file) fs.unlinkSync(req.file.path);
        console.error("Image upload error:", uploadError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// @desc    Change User Password
// @route   PUT /api/user/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both current password and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isCurrentPasswordMatch = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const isNewPasswordSame = await user.comparePassword(newPassword);
    if (isNewPasswordSame) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

// @desc Send OTP for User
// @route PUT /api/user/send-otp
// @access Public
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide an email address" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate OTP and expiry
    const otp = generateOTP();
    const otpExpiresAt = getOTPExpiry();

    user.otp = otp;
    user.otpExpires = otpExpiresAt;
    user.otpVerified = false; // Reset verification flag when sending new OTP
    await user.save();

    // Send OTP via email
    await sendOTPEmail({
      to: email,
      otp,
      senderLabel: "SeagullsFM",
      emailUser: process.env.EMAIL_USER,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      success: false,
      message: "Error sending OTP",
      error: error.message,
    });
  }
};

// @desc Verify OTP for User
// @route POST /api/user/verify-otp
// @access Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const lowercaseEmail = email.toLowerCase();

    const user = await User.findOne({ email: lowercaseEmail });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (
      !user.otp ||
      user.otp !== otp ||
      new Date(user.otpExpires) < new Date()
    ) {
      return res.status(401).json({ error: "Invalid or expired OTP" });
    }

    // Mark OTP as verified - allows one password reset
    user.otpVerified = true;
    await user.save();

    res.status(200).json({ message: "OTP correct!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc Changing Password after sending OTP
// @route POST /api/user/reset-password
// @access Public
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmNewPassword } = req.body;

    // Validation
    if (!email || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide new password and confirm new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if OTP has been verified (allows one password reset per verification)
    if (!user.otpVerified) {
      return res.status(401).json({
        success: false,
        message: "OTP must be verified first. Please verify your OTP before resetting password.",
      });
    }

    const isPasswordMatch = newPassword === confirmNewPassword;
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "New Password and the confirm do not match",
      });
    }

    const isNewPasswordSame = await user.comparePassword(newPassword);
    if (isNewPasswordSame) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Reset password
    user.password = newPassword;
    
    // Clear OTP and verification flag after successful password reset to prevent reuse
    user.otp = null;
    user.otpExpires = null;
    user.otpVerified = false;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

// @desc    Delete User image
// @route   DELETE /api/user/delete-image
// @access  Private
export const deleteImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete image from cloudinary if exists
    if (user.image && user.image.public_id) {
      try {
        await cloudinary.uploader.destroy(user.image.public_id);
      } catch (cloudinaryError) {
        console.error("Error deleting image from cloudinary:", cloudinaryError);
      }
    }

    // Remove image info from user
    user.image = {
      public_id: null,
      url: null,
    };
    await user.save();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting image",
      error: error.message,
    });
  }
};

// @desc    Logout User
// @route   POST /api/user/logout
// @access  Private
export const logoutUser = async (req, res) => {
  try {
    // Clear the token cookie
    clearTokenCookie(res);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging out",
      error: error.message,
    });
  }
};

// @desc    Toggle Active Status (Admin only)
// @route   PUT /api/user/:id/toggle-active
// @access  Private (Admin)
export const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if User exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle verification status
    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling User Active Status",
      error: error.message,
    });
  }
};

// @desc    Delete User (Admin only)
// @route   DELETE /api/user/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete image from cloudinary if exists
    if (user.image && user.image.public_id) {
      try {
        await cloudinary.uploader.destroy(user.image.public_id);
      } catch (cloudinaryError) {
        console.error("Error deleting image from cloudinary:", cloudinaryError);
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

