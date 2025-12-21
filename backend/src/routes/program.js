import express from 'express';
import { body } from 'express-validator';
import {
  createProgram,
  getPrograms,
  getProgramById,
  updateProgram,
  deleteProgram
} from '../controllers/programController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import { cleanFormData } from '../middleware/cleanFormData.js';

const router = express.Router();

// Validation rules
const programValidation = [
  body('title')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('channelId')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .notEmpty()
    .withMessage('Channel ID is required')
    .isMongoId()
    .withMessage('Invalid channel ID format'),
  body('description')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 100 })
    .withMessage('Description cannot exceed 100 characters'),
  body('day')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .notEmpty()
    .withMessage('Day is required')
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Day must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday'),
  body('startTime')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format (24-hour)'),
  body('endTime')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .notEmpty()
    .withMessage('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format (24-hour)'),
  body('status')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive')
];

const updateProgramValidation = [
  body('title')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim(),
  body('channelId')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .isMongoId()
    .withMessage('Invalid channel ID format'),
  body('description')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Description cannot exceed 100 characters'),
  body('day')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Day must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday'),
  body('startTime')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format (24-hour)'),
  body('endTime')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format (24-hour)'),
  body('status')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive')
];

// Routes
router.post('/', protect, authorize('admin', 'superadmin'), upload.single('image'), cleanFormData, programValidation, validate, createProgram);
router.get('/', getPrograms);
router.get('/:id', getProgramById);
router.put('/:id', protect, authorize('admin', 'superadmin'), upload.single('image'), cleanFormData, updateProgramValidation, validate, updateProgram);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteProgram);

export default router;

