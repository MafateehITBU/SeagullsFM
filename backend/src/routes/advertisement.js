import express from 'express';
import {
    createAdvertisement,
    getAllAdvertisements,
    getAdvertisementById,
    deleteAdvertisementById
} from '../controllers/advertisementController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createAdvertisement);

// Protected routes (Admin, SuperAdmin)
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/', getAllAdvertisements);
router.get('/:id', getAdvertisementById);
router.delete('/:id', deleteAdvertisementById);

export default router;