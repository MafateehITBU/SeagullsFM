import express from 'express';
import { body } from 'express-validator';
import {
  createStaticInfo,
  getStaticInfos,
  getStaticInfoByChannelId,
  updateStaticInfo,
  deleteStaticInfo
} from '../controllers/staticInfoController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import { cleanFormData } from '../middleware/cleanFormData.js';

const router = express.Router();

// Validation rules
const staticInfoValidation = [
  body('aboutUS')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .notEmpty()
    .withMessage('About US is required'),
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
  body('frequency')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .notEmpty()
    .withMessage('Frequency is required'),
  body('socialMediaLinks')
    .notEmpty()
    .withMessage('Social media links are required'),
  body('downloadApp')
    .notEmpty()
    .withMessage('Download app links are required'),
  body('metaTags')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .notEmpty()
    .withMessage('Meta tags are required'),
  body('metaDescription')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .notEmpty()
    .withMessage('Meta description is required'),
  body('phoneNumber')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('email')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('address')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .notEmpty()
    .withMessage('Address is required')
];

const updateStaticInfoValidation = [
  body('aboutUS')
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
  body('frequency')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim(),
  body('phoneNumber')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim(),
  body('email')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('address')
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
router.post('/', protect, authorize('admin', 'superadmin'), upload.fields([
  { name: 'frequencyimg', maxCount: 1 },
  { name: 'favIcon', maxCount: 1 }
]), cleanFormData, staticInfoValidation, validate, createStaticInfo);
router.get('/', getStaticInfos);
router.get('/:channelId', getStaticInfoByChannelId);
router.put('/:channelId', protect, authorize('admin', 'superadmin'), upload.fields([
  { name: 'frequencyimg', maxCount: 1 },
  { name: 'favIcon', maxCount: 1 }
]), cleanFormData, updateStaticInfoValidation, validate, updateStaticInfo);
router.delete('/:channelId', protect, authorize('admin', 'superadmin'), deleteStaticInfo);

export default router;

