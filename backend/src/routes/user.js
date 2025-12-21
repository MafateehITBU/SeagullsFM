import express from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  getAllUsers,
  updateProfile,
  changePassword,
  sendOTP,
  verifyOTP,
  resetPassword,
  deleteImage,
  logoutUser,
  toggleActive,
  deleteUser
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
];

// Public routes
router.post('/register', upload.single('image'), registerValidation, validate, registerUser);
router.post('/login', loginValidation, validate, loginUser);
router.put('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Protected routes (user must be logged in)
router.use(protect);

// Logout - works for any authenticated user (user, admin, superadmin) - MUST be before any parameterized routes
router.post('/logout', logoutUser);

// User-specific routes (require user role)
router.get('/me', authorize('user'), getCurrentUser);
router.put('/profile', authorize('user'), updateProfileValidation, validate, upload.single('image'), updateProfile);
router.put('/change-password', authorize('user'), changePasswordValidation, validate, changePassword);
router.delete('/delete-image', authorize('user'), deleteImage);

// Admin routes (require admin or superadmin role) - MUST be after all user routes
router.get('/', authorize('admin', 'superadmin'), getAllUsers);
router.put('/:id/toggle-active', authorize('admin', 'superadmin'), toggleActive);
router.delete('/:id', authorize('admin', 'superadmin'), deleteUser);

export default router;

