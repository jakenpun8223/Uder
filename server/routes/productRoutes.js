import express from 'express';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- PUBLIC ROUTES (Everyone can see the menu) ---
router.get('/', async (req, res) => {
    try {
        const { restaurantId } = req.query;
        if (!restaurantId || restaurantId === 'undefined') {
            return res.status(400).json({ message: "Restaurant ID is required to view menu." });
        }
        const menu = await Product.find({ restaurant: restaurantId, isAvailable: true });
        res.json(menu);
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
});

// --- PROTECTED ROUTES (Staff/Admin/Kitchen) ---

// 1. GET Full list 
// Kitchen needs to see even unavailable items to manage them.
router.get('/all', protect, authorize('admin', 'kitchen'), async (req,res) => {
    try {
        const allProducts = await Product.find({ restaurant: req.user.restaurant });
        res.json(allProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Add New Item 
// CHANGED: Added 'kitchen' role so the Chef can add specials/new dishes
router.post('/', protect, authorize('admin', 'kitchen'), async (req,res) => {
    try {
        const newProduct = new Product({
            ...req.body,
            restaurant: req.user.restaurant 
        });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch(error) {
        res.status(400).json({ message: error.message });
    }
});

// 3. Update Existing Item (New Route)
// Allows Chef to fix prices, change ingredients, or update descriptions
router.put('/:id', protect, authorize('admin', 'kitchen'), async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // Returns the updated doc & enforces Schema validation
        );

        if(!product) return res.status(404).json({ message: "Product not found" });

        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 4. Remove Item (New Route)
// Allows Chef to remove old seasonal items
router.delete('/:id', protect, authorize('admin', 'kitchen'), async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if(!product) return res.status(404).json({ message: "Product not found" });

        res.json({ message: "Product removed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5. Toggle Availability (Kitchen/Admin)
// Existing logic allows Chef to 86 (mark out) items immediately
router.patch('/:id/toggle', protect, authorize('admin', 'kitchen'), async (req,res) => {
    try {
        const product = await Product.findOne({ 
            _id: req.params.id, 
            restaurant: req.user.restaurant 
        });
        
        if(!product) return res.status(404).json({ message: "Product not found" });

        product.isAvailable = !product.isAvailable;
        await product.save();
        
        res.json(product);
    } catch(error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;