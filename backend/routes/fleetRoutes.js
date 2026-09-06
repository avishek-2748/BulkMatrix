import express from 'express';
import { getAllFleet, getVessel } from '../controllers/fleetController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllFleet);
router.get('/:id', protect, getVessel);

export default router;
