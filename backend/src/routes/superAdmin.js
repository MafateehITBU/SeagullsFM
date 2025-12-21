import express from 'express';
import { body } from 'express-validator';
import {
  registerSuperAdmin,
  loginSuperAdmin,
  getMe,
  getAllSuperAdmins,
  getSuperAdminById,
  updateSuperAdmin,
  deleteImage,
  deleteSuperAdmin,
  logoutSuperAdmin,
  changePassword
} from '../controllers/superAdminController.js';
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
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^(\+?1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/)
    .withMessage('Please enter a valid phone number')
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
router.post('/register', upload.single('image'), registerSuperAdmin);
router.post('/login', loginValidation, validate, loginSuperAdmin);

// Protected routes
router.use(protect); // Apply authentication to all routes below

router.get('/me', getMe);
router.post('/logout', logoutSuperAdmin);
router.put('/change-password', changePasswordValidation, validate, changePassword);

// SuperAdmin only routes
router.use(authorize('superadmin')); // Apply authorization to all routes below

router.get('/', getAllSuperAdmins);
router.get('/:id', getSuperAdminById);
router.put('/:id', upload.single('image'), updateSuperAdmin);
router.delete('/:id/delete-image', deleteImage);
router.delete('/:id', deleteSuperAdmin);

export default router; 