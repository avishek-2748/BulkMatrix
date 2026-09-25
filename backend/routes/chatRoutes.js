import express from 'express';
import { sendMessage, getMessages, getChatThreads } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/threads/all', protect, getChatThreads);
router.get('/:contractId', protect, getMessages);
router.post('/', protect, sendMessage);

export default router;
