import express from 'express';
import { createOrder, getAllOrders, updateOrderStatus, addItemsToOrder, generatePaymentLink, closeTableAfterPayment } from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('staff', 'admin'), createOrder); 
router.post('/:id/add', protect, authorize('staff', 'admin'), addItemsToOrder);
router.get('/', protect, authorize('kitchen', 'staff', 'admin'), getAllOrders);
router.patch('/:id/status', protect, authorize('kitchen', 'staff', 'admin'), updateOrderStatus);

// NEW CLEARING COMPANY ROUTES
router.post('/generate-payment', protect, authorize('staff', 'admin'), generatePaymentLink);
router.post('/close-table', protect, authorize('staff', 'admin'), closeTableAfterPayment);

export default router;