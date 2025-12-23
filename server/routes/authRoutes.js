import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// Route: POST /api/auth/register
router.post('/register', register);

// Route: POST /api/auth/login
router.post('/login', login);

//check if the backend gave thumbs up for the front
router.get('/me', protect, getMe);

export default router;