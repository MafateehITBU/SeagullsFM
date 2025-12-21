import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getAvatarUrl } from '../utils/avatarGenerator.js';

const superAdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  image: {
    public_id: {
      type: String,
      default: null
    },
    url: {
      type: String,
      default: null
    }
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [
      /^(\+?1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
      'Please enter a valid phone number'
    ]
  },
  role: {
    type: String,
    default: 'superadmin',
    enum: ['superadmin']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
}, {
  timestamps: true
});

// Encrypt password before saving
superAdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
superAdminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
superAdminSchema.methods.getJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Remove password from response and add default avatar only if no image is uploaded
superAdminSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;

  // Only use default avatar if image is null, undefined, or has no URL
  if (!user.image || !user.image.url) {
    user.image = getAvatarUrl(user);
  }

  return user;
};

export default mongoose.model('SuperAdmin', superAdminSchema); 