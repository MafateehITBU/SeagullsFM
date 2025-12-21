import express from 'express';
import {
    createNews,
    getAllNews,
    getNewsById,
    updateNews,
    deleteNews
} from '../controllers/newsController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllNews);
router.get('/:id', getNewsById);

// Protected routes (Admin, SuperAdmin)
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.post('/', upload.single('image'), createNews);
router.put('/:id', upload.single('image'), updateNews);
router.delete('/:id', deleteNews);

export default router;