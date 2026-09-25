import express from 'express';
import { getNotifications, getUnreadCount, markAllRead, markOneRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.get('/count', protect, getUnreadCount);
router.put('/read-all', protect, markAllRead);
router.put('/:id/read', protect, markOneRead);

export default router;
