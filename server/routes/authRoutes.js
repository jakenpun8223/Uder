import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route: POST /api/auth/register
router.post('/register', register);

// Route: POST /api/auth/login
router.post('/login', login);

// --- 2. Add the Logout Route ---
router.post('/logout', logout);

//check if the backend gave thumbs up for the front
router.get('/me', protect, getMe);

export default router;