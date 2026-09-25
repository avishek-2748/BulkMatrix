import express from 'express';
import { addVessel, getMyVessels, getVesselById, updateVessel, deleteVessel, getLiveTracking } from '../controllers/vesselController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/live-tracking', protect, getLiveTracking);
router.post('/', protect, addVessel);
router.get('/', protect, getMyVessels);
router.get('/:id', protect, getVesselById);
router.put('/:id', protect, updateVessel);
router.delete('/:id', protect, deleteVessel);

export default router;
