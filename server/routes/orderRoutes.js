import express from 'express';
import { createOrder, getAllOrders, updateOrderStatus, addItemsToOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js'; // Import protect

const router = express.Router();

// WAITER ONLY: Start a new table order
// Added 'protect' so unauthenticated customers cannot create orders
router.post('/', protect, createOrder); 

// WAITER: Add items
router.post('/:id/add', protect, addItemsToOrder);

// KITCHEN: Get orders
router.get('/', protect, getAllOrders);

// CHEF: Update status
router.patch('/:id/status', protect, updateOrderStatus);

export default router;