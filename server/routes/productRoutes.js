import express from 'express';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- PUBLIC ROUTES (Everyone can see the menu) ---
router.get('/', async (req, res) => {
    try {
        const menu = await Product.find({ isAvailable: true });
        res.json(menu);
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
});

// --- PROTECTED ROUTES (Staff/Admin only) ---

// 1. GET Full list (Kitchen needs to see even unavailable items)
router.get('/all', protect, authorize('admin', 'kitchen'), async (req,res) => {
    const allProducts = await Product.find({});
    res.json(allProducts);
});

// 2. Add New Item (Admin Only)
router.post('/', protect, authorize('admin'), async (req,res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch(error) {
        res.status(400).json({ message: error.message });
    }
});

// 3. Toggle Availability (Kitchen/Admin)
router.patch('/:id/toggle', protect, authorize('admin', 'kitchen'), async (req,res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(!product) return res.status(404).json({ message: "Product not found" });

        product.isAvailable = !product.isAvailable;
        await product.save();
        
        res.json(product);
    } catch(error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;