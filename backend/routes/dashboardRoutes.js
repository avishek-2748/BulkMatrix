import express from 'express';
import { getDashboardKPIs } from '../controllers/dashboardController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/kpis', protect, getDashboardKPIs);

export default router;
