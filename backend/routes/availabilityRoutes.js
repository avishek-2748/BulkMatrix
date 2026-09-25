import express from 'express';
import { addAvailability, getAvailability } from '../controllers/availabilityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, addAvailability);
router.get('/:vesselId', protect, getAvailability);

export default router;
