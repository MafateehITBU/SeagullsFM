import express from 'express';
import { body } from 'express-validator';
import {
  createProgram,
  getPrograms,
  getProgramById,
  updateProgram,
  toggleActive,
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
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('days')
    .custom((value) => {
      // Accept array (from form-data or already parsed) or string
      let daysArray = value;
      if (typeof value === 'string') {
        // Try to parse as JSON first
        try {
          daysArray = JSON.parse(value);
        } catch {
          // If not JSON, check if it's a string representation of an array
          // Handle formats like: "['Sunday', 'Monday']" or '["Sunday", "Monday"]'
          const trimmed = value.trim();
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
              // Remove outer brackets and split
              const inner = trimmed.slice(1, -1);
              daysArray = inner.split(',').map(item => {
                return item.trim().replace(/^["']|["']$/g, '').replace(/^['"]|['"]$/g, '');
              }).filter(item => item.length > 0);
            } catch {
              daysArray = [value];
            }
          } else {
            // Single day string
            daysArray = [value];
          }
        }
      }
      if (!Array.isArray(daysArray) || daysArray.length === 0) {
        throw new Error('Days must be a non-empty array');
      }
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const invalidDays = daysArray.filter(day => !validDays.includes(day));
      if (invalidDays.length > 0) {
        throw new Error(`Invalid days: ${invalidDays.join(', ')}. Days must be one or more of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday`);
      }
      return true;
    })
    .withMessage('Days must be a non-empty array of valid days'),
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
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('days')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null) {
        return true; // Optional field
      }
      // Accept array (from form-data or already parsed) or string
      let daysArray = value;
      if (typeof value === 'string') {
        // Try to parse as JSON first
        try {
          daysArray = JSON.parse(value);
        } catch {
          // If not JSON, check if it's a string representation of an array
          // Handle formats like: "['Sunday', 'Monday']" or '["Sunday", "Monday"]'
          const trimmed = value.trim();
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
              // Remove outer brackets and split
              const inner = trimmed.slice(1, -1);
              daysArray = inner.split(',').map(item => {
                return item.trim().replace(/^["']|["']$/g, '').replace(/^['"]|['"]$/g, '');
              }).filter(item => item.length > 0);
            } catch {
              daysArray = [value];
            }
          } else {
            // Single day string
            daysArray = [value];
          }
        }
      }
      if (!Array.isArray(daysArray) || daysArray.length === 0) {
        throw new Error('Days must be a non-empty array');
      }
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const invalidDays = daysArray.filter(day => !validDays.includes(day));
      if (invalidDays.length > 0) {
        throw new Error(`Invalid days: ${invalidDays.join(', ')}. Days must be one or more of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday`);
      }
      return true;
    })
    .withMessage('Days must be a non-empty array of valid days'),
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
];

// Routes
router.post('/', protect, authorize('admin', 'superadmin'), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'programDetailsImage', maxCount: 1 }]), cleanFormData, programValidation, validate, createProgram);
router.get('/', getPrograms);
router.get('/:id', getProgramById);
router.put('/:id', protect, authorize('admin', 'superadmin'), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'programDetailsImage', maxCount: 1 }]), cleanFormData, updateProgramValidation, validate, updateProgram);
router.put('/:id/toggle-active', protect, authorize('admin', 'superadmin'), toggleActive);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteProgram);

export default router;

