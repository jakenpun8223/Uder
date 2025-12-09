import express from 'express';
import {
    createOrder,
    getAllOrders,
    updateOrderStatus,
    addItemsToOrder
} from '../controllers/orderController.js';

const router = express.Router();

// WAITER: Start a new table order
router.post('/', createOrder);

// WAITER: Add items to existing order (e.g. /api/orders/65a2b.../add)
router.post('/:id/add', addItemsToOrder);

// KITCHEN/ADMIN: See all orders
router.get('/', getAllOrders);

// CHEF/WAITER: Change status
router.patch('/:id/status', updateOrderStatus);

export default router;