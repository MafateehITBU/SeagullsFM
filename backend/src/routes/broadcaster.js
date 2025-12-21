import express from 'express';
import { body } from 'express-validator';
import {
  createBroadcaster,
  getBroadcasters,
  getBroadcasterById,
  updateBroadcaster,
  deleteBroadcaster
} from '../controllers/broadcasterController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import { cleanFormData } from '../middleware/cleanFormData.js';

const router = express.Router();

// Validation rules
const broadcasterValidation = [
  body('name')
    .customSanitizer((value) => {
      // Remove quotes if present (from form data)
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  body('channelId')
    .customSanitizer((value) => {
      // Remove quotes if present (from form data)
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
    .optional()
    .customSanitizer((value) => {
      // Remove quotes if present (from form data)
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('socialLinks')
    .optional()
    .customSanitizer((value) => {
      // Remove quotes if present and parse JSON string
      if (typeof value === 'string') {
        const cleaned = value.replace(/^["']|["']$/g, '');
        try {
          return JSON.parse(cleaned);
        } catch {
          return cleaned;
        }
      }
      return value;
    })
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      }
      return typeof value === 'object';
    })
    .withMessage('Social links must be a valid object or JSON string')
];

const updateBroadcasterValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  body('channelId')
    .optional()
    .isMongoId()
    .withMessage('Invalid channel ID format'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('socialLinks')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      }
      return typeof value === 'object';
    })
    .withMessage('Social links must be a valid object or JSON string')
];

// Routes
router.post('/', protect, authorize('admin', 'superadmin'), upload.single('image'), cleanFormData, broadcasterValidation, validate, createBroadcaster);
router.get('/', getBroadcasters);
router.get('/:id', getBroadcasterById);
router.put('/:id', protect, authorize('admin', 'superadmin'), upload.single('image'), cleanFormData, updateBroadcasterValidation, validate, updateBroadcaster);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteBroadcaster);

export default router;

