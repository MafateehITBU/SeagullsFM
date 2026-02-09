import express from 'express';
import { getMoodFmStream, getMoodFmStreamDebug, getMoodFmStreamStatus } from '../controllers/streamController.js';

const router = express.Router();

router.get('/moodfm/status', getMoodFmStreamStatus);
router.get('/moodfm/debug', getMoodFmStreamDebug);
router.get('/moodfm', getMoodFmStream);

export default router;
