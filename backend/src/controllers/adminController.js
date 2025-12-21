import Admin from "../models/Admin.js";
import SuperAdmin from "../models/SuperAdmin.js";
import User from "../models/User.js";
import Channel from "../models/Channel.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";
import { getAvatarUrl } from "../utils/avatarGenerator.js";
import { setTokenCookie, clearTokenCookie } from "../utils/cookieUtils.js";
import { generateOTP, getOTPExpiry, sendOTPEmail } from "../utils/otp.js";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// @desc    Register Admin
// @route   POST /api/admin/register
// @access  Private
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, channelId } = req.body;

    // Validation
    if (!name || !email || !password || !phoneNumber || !channelId) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, email, password, phoneNumber and channelId",
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

    // normalize before saving (+9627xxxxxxx)
    const normalizedPhone = parsedPhone.number;

    // Check if channelId is a valid channel
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(400).json({
        success: false,
        message: "Invalid channelId. Channel does not exist.",
      });
    }

    // Check for existing email or phoneNumber across all user types
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { phoneNumber: normalizedPhone }],
    });
    const existingSuperAdmin = await SuperAdmin.findOne({
      $or: [{ email }, { phoneNumber: normalizedPhone }],
    });
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber: normalizedPhone }],
    });

    if (existingAdmin || existingSuperAdmin || existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number is already in use by another account",
      });
    }

    // Create new admin
    const admin = new Admin({
      name,
      email,
      password,
      phoneNumber: normalizedPhone,
      image: getAvatarUrl({ name }),
      channelId,
    });

    // Handle image upload if provided
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "seagulls/admins",
          width: 300,
          crop: "scale",
        });
        admin.image = {
          public_id: result.public_id,
          url: result.secure_url,
        };
        await admin.save();
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        if (req.file) fs.unlinkSync(req.file.path);
        console.error("Image upload error:", uploadError);
      }
    }

    // Save admin if image not uploaded
    if (!req.file) await admin.save();

    // Generate token
    const token = admin.getJwtToken();

    // Set token in HTTP-only cookie
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: admin,
      token,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({
      success: false,
      message: "Error registering Admin",
      error: error.message,
    });
  }
};

// @desc    Login Admin
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find admin and include password
    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if the admin isActive
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please contact support.",
      });
    }

    // Check if password matches
    const isPasswordMatch = await admin.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = admin.getJwtToken();

    // Set token in HTTP-only cookie
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: admin,
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

// @desc    Get Current Admin
// @route   GET /api/admin/me
// @access  Private
export const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching Admin",
      error: error.message,
    });
  }
};

// @desc    Get all Admins
// @route   GET /api/admin
// @access  Private
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching Admins",
      error: error.message,
    });
  }
};

// @desc    Update Admin
// @route   PUT /api/admin/:id
// @access  Private
export const updateAdmin = async (req, res) => {
  try {
    const { name, email, phoneNumber, channelId } = req.body;
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
      const existingAdmin = await Admin.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      const existingSuperAdmin = await SuperAdmin.findOne({ email });
      const existingUser = await User.findOne({ email });

      if (existingAdmin || existingSuperAdmin || existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use by another account",
        });
      }
    }

    if (phoneNumber) {
      // Prevent duplicate phone numbers across all user types
      const existingAdmin = await Admin.findOne({
        phoneNumber: updateData.phoneNumber,
        _id: { $ne: req.params.id },
      });
      const existingSuperAdmin = await SuperAdmin.findOne({
        phoneNumber: updateData.phoneNumber,
      });
      const existingUser = await User.findOne({
        phoneNumber: updateData.phoneNumber,
      });

      if (existingAdmin || existingSuperAdmin || existingUser) {
        return res.status(400).json({
          success: false,
          message: "Phone number is already in use by another account",
        });
      }
    }

    if (channelId) {
      // Check if channelId is a valid channel
      const channel = await Channel.findById(channelId);
      if (!channel) {
        return res.status(400).json({
          success: false,
          message: "Invalid channelId. Channel does not exist.",
        });
      }
      updateData.channelId = channelId;
    }

    const admin = await Admin.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Handle image upload if provided
    if (req.file) {
      try {
        if (admin.image.public_id) {
          await cloudinary.uploader.destroy(admin.image.public_id);
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "seagulls/admins",
          width: 300,
          crop: "scale",
        });

        admin.image = {
          public_id: result.public_id,
          url: result.secure_url,
        };
        await admin.save();

        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        if (req.file) fs.unlinkSync(req.file.path);
        console.error("Image upload error:", uploadError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: admin,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({
      success: false,
      message: "Error updating Admin",
      error: error.message,
    });
  }
};

// @desc    Toggle Active Status
// @route   PUT /api/admin/:id/toggle-active
// @access  Private
export const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if Admin exists
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Toggle verification status
    admin.isActive = !admin.isActive;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: `Admin ${
        admin.isActive ? "activated" : "deactivated"
      } successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling Admin Active Status",
      error: error.message,
    });
  }
};

// @desc    Delete Admin image
// @route   DELETE /api/admin/:id/delete-image
// @access  Private
export const deleteImage = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Delete image file if exists
    if (admin.image.public_id) {
      const imagePath = path.join("uploads", admin.image.public_id);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Image file deleted:", imagePath);
      }
    }

    // Remove image info from admin
    admin.image = {
      public_id: null,
      url: null,
    };
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting image",
      error: error.message,
    });
  }
};

// @desc    Delete Admin
// @route   DELETE /api/admin/:id
// @access  Private
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Delete image file if exists
    if (admin.image.public_id) {
      const imagePath = path.join("uploads", admin.image.public_id);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Image file deleted:", imagePath);
      }
    }

    await Admin.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting Admin",
      error: error.message,
    });
  }
};

// @desc Send OTP for Admin
// @route POST /api/admin/send-otp
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide an email address" });
    }

    let user = await Admin.findOne({ email });
    let role = "admin";

    if (!user) {
      user = await SuperAdmin.findOne({ email });
      role = "superadmin";
    }

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
    await user.save();

    // Send OTP via email
    await sendOTPEmail({
      to: email,
      otp,
      senderLabel: "Sergio",
      emailUser: process.env.EMAIL_USER,
    });

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${role}`,
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

// @desc Verify OTP for Admin
// @route POST /api/admin/verify-otp
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const lowercaseEmail = email.toLowerCase();

    let user = await Admin.findOne({ email: lowercaseEmail });
    if (!user) user = await SuperAdmin.findOne({ email: lowercaseEmail });

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

    res.status(200).json({ message: "OTP correct!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc Changing Password after sending OTP
// @route POST /api/admin/reset-password
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

    let user = await Admin.findOne({ email }).select("+password");
    if (!user) user = await SuperAdmin.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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

// @desc    Change Admin Password
// @route   PUT /api/admin/change-password
export const changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    // Validation
    if (!email || !currentPassword || !newPassword) {
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

    let user = await Admin.findOne({ email }).select("+password");
    if (!user) user = await SuperAdmin.findOne({ email }).select("+password");

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

// @desc    Logout Admin
// @route   POST /api/admin/logout
// @access  Private
export const logoutAdmin = async (req, res) => {
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
