import SuperAdmin from '../models/SuperAdmin.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import { setTokenCookie, clearTokenCookie } from '../utils/cookieUtils.js';

// @desc    Register SuperAdmin
// @route   POST /api/superadmin/register
// @access  Public
export const registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Validation
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, phoneNumber'
      });
    }

    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 50 characters'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email'
      });
    }

    const phoneRegex = /^(\+?1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number'
      });
    }

    // Check for existing email across all user types
    const existingSuperAdmin = await SuperAdmin.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });
    const existingUser = await User.findOne({ email });

    if (existingSuperAdmin || existingAdmin || existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use by another account'
      });
    }

    // Create superadmin
    const superAdmin = await SuperAdmin.create({
      name,
      email,
      password,
      phoneNumber
    });

    // Handle image upload if provided
    if (req.file) {
      try {
        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'seagulls/superadmins',
          width: 300,
          crop: 'scale'
        });
        // Update superadmin with Cloudinary image info
        superAdmin.image = {
          public_id: result.public_id,
          url: result.secure_url
        };
        await superAdmin.save();
        // Delete file from server
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        console.error('Image upload error:', uploadError);
        // Continue without image if upload fails
      }
    }

    // Generate token
    const token = superAdmin.getJwtToken();

    // Set token in HTTP-only cookie
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'SuperAdmin registered successfully',
      data: superAdmin,
      token // Still return token for mobile apps or if needed
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Error registering SuperAdmin',
      error: error.message
    });
  }
};

// @desc    Login SuperAdmin
// @route   POST /api/superadmin/login
// @access  Public
export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find superadmin and include password
    const superAdmin = await SuperAdmin.findOne({ email }).select('+password');
    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isPasswordMatch = await superAdmin.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    superAdmin.lastLogin = new Date();
    await superAdmin.save();

    // Generate token
    const token = superAdmin.getJwtToken();

    // Set token in HTTP-only cookie
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: superAdmin,
      token // Still return token for mobile apps or if needed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Get current SuperAdmin
// @route   GET /api/superadmin/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const superAdmin = await SuperAdmin.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: superAdmin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching SuperAdmin',
      error: error.message
    });
  }
};

// @desc    Get all SuperAdmins
// @route   GET /api/superadmin
// @access  Private
export const getAllSuperAdmins = async (req, res) => {
  try {
    const superAdmins = await SuperAdmin.find();
    
    res.status(200).json({
      success: true,
      data: superAdmins
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching SuperAdmins',
      error: error.message
    });
  }
};

// @desc    Get SuperAdmin by ID
// @route   GET /api/superadmin/:id
// @access  Private
export const getSuperAdminById = async (req, res) => {
  try {
    const superAdmin = await SuperAdmin.findById(req.params.id);
    
    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: 'SuperAdmin not found'
      });
    }

    res.status(200).json({
      success: true,
      data: superAdmin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching SuperAdmin',
      error: error.message
    });
  }
};

// @desc    Update SuperAdmin
// @route   PUT /api/superadmin/:id
// @access  Private
export const updateSuperAdmin = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;
    const updateData = {};

    // Validation for provided fields
    if (name) {
      if (name.length < 2 || name.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Name must be between 2 and 50 characters'
        });
      }
      updateData.name = name;
    }

    if (email) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid email'
        });
      }
      updateData.email = email;
    }

    if (phoneNumber) {
      const phoneRegex = /^(\+?1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
      if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid phone number'
        });
      }
      updateData.phoneNumber = phoneNumber;
    }

    // Check if email is being updated and if it already exists across all user types
    if (email) {
      const existingSuperAdmin = await SuperAdmin.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      const existingAdmin = await Admin.findOne({ email });
      const existingUser = await User.findOne({ email });

      if (existingSuperAdmin || existingAdmin || existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another account'
        });
      }
    }

    const superAdmin = await SuperAdmin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: 'SuperAdmin not found'
      });
    }

    // Handle image upload if provided
    if (req.file) {
      try {
        // Delete old image from Cloudinary if exists
        if (superAdmin.image.public_id) {
          await cloudinary.uploader.destroy(superAdmin.image.public_id);
        }
        // Upload new image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'seagulls/superadmins',
          width: 300,
          crop: 'scale'
        });
        // Update superadmin with new Cloudinary image info
        superAdmin.image = {
          public_id: result.public_id,
          url: result.secure_url
        };
        await superAdmin.save();
        // Delete file from server
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        console.error('Image upload error:', uploadError);
        // Continue without image if upload fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'SuperAdmin updated successfully',
      data: superAdmin
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Error updating SuperAdmin',
      error: error.message
    });
  }
};

// @desc    Delete SuperAdmin image
// @route   DELETE /api/superadmin/:id/delete-image
// @access  Private
export const deleteImage = async (req, res) => {
  try {
    const superAdmin = await SuperAdmin.findById(req.params.id);
    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: 'SuperAdmin not found'
      });
    }

    // Delete image file if exists
    if (superAdmin.image.public_id) {
      const imagePath = path.join('uploads', superAdmin.image.public_id);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Image file deleted:', imagePath);
      }
    }

    // Remove image info from superadmin
    superAdmin.image = {
      public_id: null,
      url: null
    };
    await superAdmin.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: superAdmin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
};

// @desc    Delete SuperAdmin
// @route   DELETE /api/superadmin/:id
// @access  Private
export const deleteSuperAdmin = async (req, res) => {
  try {
    const superAdmin = await SuperAdmin.findById(req.params.id);
    
    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: 'SuperAdmin not found'
      });
    }

    // Delete image file if exists
    if (superAdmin.image.public_id) {
      const imagePath = path.join('uploads', superAdmin.image.public_id);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Image file deleted:', imagePath);
      }
    }

    await SuperAdmin.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'SuperAdmin deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting SuperAdmin',
      error: error.message
    });
  }
};

// @desc    Change SuperAdmin Password
// @route   PUT /api/superadmin/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Get superadmin with password
    const superAdmin = await SuperAdmin.findById(req.user.id).select('+password');
    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: 'SuperAdmin not found'
      });
    }

    // Check if current password matches
    const isCurrentPasswordMatch = await superAdmin.comparePassword(currentPassword);
    if (!isCurrentPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is same as current password
    const isNewPasswordSame = await superAdmin.comparePassword(newPassword);
    if (isNewPasswordSame) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Update password
    superAdmin.password = newPassword;
    await superAdmin.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// @desc    Logout SuperAdmin
// @route   POST /api/superadmin/logout
// @access  Private
export const logoutSuperAdmin = async (req, res) => {
  try {
    // Clear the token cookie
    clearTokenCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message
    });
  }
}; 