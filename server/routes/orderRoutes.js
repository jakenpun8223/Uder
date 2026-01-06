import express from 'express';
import { createOrder, getAllOrders, updateOrderStatus, addItemsToOrder } from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js'; // Import protect

const router = express.Router();

// WAITER ONLY: Start a new table order
// Added 'protect' so unauthenticated customers cannot create orders
router.post('/', protect, authorize('staff', 'admin'), createOrder); 

// WAITER: Add items
router.post('/:id/add', protect, authorize('staff', 'admin'), addItemsToOrder);

// KITCHEN: Get orders
router.get('/', protect, authorize('kitchen', 'staff', 'admin'), getAllOrders);

// CHEF: Update status
router.patch('/:id/status', protect, authorize('kitchen', 'staff', 'admin'), updateOrderStatus);

export default router;