import express from 'express';
import { getOwnerProfile, updateOwnerProfile } from '../controllers/ownerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getOwnerProfile);
router.put('/profile', protect, updateOwnerProfile);

export default router;
