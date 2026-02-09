import express from 'express';
import {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
} from '../controllers/eventController.js';
import { protect, authorize, permissions } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { cleanFormData } from '../middleware/cleanFormData.js';

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes (Admin, SuperAdmin)
router.use(protect);
router.use(authorize('admin', 'superadmin'));
router.use(permissions('events'));

router.post('/', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'images', maxCount: 10 }]), cleanFormData, createEvent);
router.put('/:id', upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'images', maxCount: 10 }]), cleanFormData, updateEvent);
router.delete('/:id', deleteEvent);

export default router;