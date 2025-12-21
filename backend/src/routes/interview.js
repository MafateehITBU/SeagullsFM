import express from 'express';
import { body } from 'express-validator';
import {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview
} from '../controllers/interviewController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import uploadVideo from '../middleware/uploadVideo.js';
import { cleanFormData } from '../middleware/cleanFormData.js';

const router = express.Router();

// Validation rules
const interviewValidation = [
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
  body('programId')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .notEmpty()
    .withMessage('Program ID is required')
    .isMongoId()
    .withMessage('Invalid program ID format'),
  body('date')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .notEmpty()
    .withMessage('Date is required')
    .custom((value) => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .withMessage('Invalid date format. Please use a valid date (YYYY-MM-DD or ISO format)'),
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
];

const updateInterviewValidation = [
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
  body('programId')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .isMongoId()
    .withMessage('Invalid program ID format'),
  body('date')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .custom((value) => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .withMessage('Invalid date format. Please use a valid date (YYYY-MM-DD or ISO format)'),
  body('description')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
];

// Routes
router.post('/', protect, authorize('admin', 'superadmin'), uploadVideo.single('content'), cleanFormData, interviewValidation, validate, createInterview);
router.get('/', getInterviews);
router.get('/:id', getInterviewById);
router.put('/:id', protect, authorize('admin', 'superadmin'), uploadVideo.single('content'), cleanFormData, updateInterviewValidation, validate, updateInterview);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteInterview);

export default router;

