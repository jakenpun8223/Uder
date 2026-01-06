import express from 'express';
import { getAllUsers, createStaffUser } from '../controllers/userController.js';
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();


router.get('/all', getAllUsers);

//To create user
router.post('/staff', protect, createStaffUser);

export default router;