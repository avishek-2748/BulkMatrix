import express from 'express';
import { getSystemStats, updateAisPosition } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/stats', protect, admin, getSystemStats);
router.post('/ais', protect, admin, updateAisPosition);

export default router;
