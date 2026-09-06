import express from 'express';
import { generateRecommendation } from '../controllers/charterController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/recommendation', protect, generateRecommendation);

export default router;
