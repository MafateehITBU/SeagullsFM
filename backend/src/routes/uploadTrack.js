import express from 'express';
import { body } from 'express-validator';
import {
  uploadTrack,
  getUploadTracks,
  getMyTracks,
  getUploadTrackById,
  updateTrackStatus,
  approveTrack,
  deleteUploadTrack,
  getApprovedTracks
} from '../controllers/uploadTrackController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import uploadVideo from '../middleware/uploadVideo.js';
import { cleanFormData } from '../middleware/cleanFormData.js';

const router = express.Router();

// Validation rules
const uploadTrackValidation = [
  body('songName')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.replace(/^["']|["']$/g, '');
      }
      return value;
    })
    .trim()
    .notEmpty()
    .withMessage('Song name is required'),
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
  body('genre')
    .notEmpty()
    .withMessage('Genre is required')
];

const approveTrackValidation = [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .custom((value) => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .withMessage('Invalid date format'),
  body('time')
    .trim()
    .notEmpty()
    .withMessage('Time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format (24-hour)')
];

const updateStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Pending', 'Checked', 'Approved', 'Declined'])
    .withMessage('Status must be one of: Pending, Checked, Approved, Declined')
];

// Routes
// User routes
router.post('/', protect, authorize('user'), uploadVideo.single('songFile'), cleanFormData, uploadTrackValidation, validate, uploadTrack);
router.get('/my-tracks', protect, authorize('user'), getMyTracks);

// Admin routes
router.get('/', protect, authorize('admin', 'superadmin'), getUploadTracks);
router.get('/approved/list', getApprovedTracks); // Public route for approved tracks
router.get('/:id', protect, getUploadTrackById);
router.put('/:id/status', protect, authorize('admin', 'superadmin'), updateStatusValidation, validate, updateTrackStatus);
router.post('/:id/approve', protect, authorize('admin', 'superadmin'), approveTrackValidation, validate, approveTrack);
router.delete('/:id', protect, deleteUploadTrack);

export default router;

