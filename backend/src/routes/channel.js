import express from 'express';
import { body } from 'express-validator';
import {
  createChannel,
  getChannels,
  getChannelById,
  updateChannel,
  deleteChannel
} from '../controllers/channelController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Validation rules
const channelValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Channel name is required')
    .isLength({ max: 100 })
    .withMessage('Channel name cannot exceed 100 characters')
];

router.post('/', protect, authorize('superadmin'), channelValidation, validate, createChannel);
router.get('/', getChannels);
router.get('/:id', getChannelById);
router.put('/:id', protect, authorize('superadmin'), channelValidation, validate, updateChannel);
router.delete('/:id', protect, authorize('superadmin'), deleteChannel);

export default router;