import express from 'express';
import { signup, login, logout, getMe, verifyEmail, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-email', verifyEmail);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
