import express from 'express';
import { getAllUsers, createStaffUser } from '../controllers/userController.js';


const router = express.Router();


router.get('/all', getAllUsers);

//To create user
router.post('/staff', createStaffUser);

export default router;