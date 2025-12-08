import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// --- CUSTOMER ROUTES ---

// 1. GET Menu for Customers (Only show Available items)
router.get('/', async (req, res) => {
    try{
        // FILTER: Only find products where isAvailable is TRUE
        const menu = await Product.find({ isAvailable: true });
        res.json(menu);
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
});

// --- CHEF / ADMIN ROUTES ---

// GET All products (For Chef to see the full list)
router.get('/all', async (req,res) => {
    try{
        // No Filter: Return everything (even unavailable once)
        const allProducts = await Product.find({});
        res.json(allProducts);
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
});

// TOGGLE Availability (Chefs adds/removes item from menu)
router.patch('/:id/toggle', async (req,res) => {
    try{
        const product = await Product.findById(req.params.id);
        if(!product) return res.status(404).json({ message: "Product not found" });

        // Flip the switch (True -> False, or False -> True)
        product.isAvailable = !product.isAvailable;
        await product.save();
        
        res.json(product);
    }
    catch(error){
        res.status(400).json({ message: error.message });
    }
});

// Create new Product (Add to the master list)
router.post('/', async (req,res) => {
    const { name, price, category, description } = req.body;
    try{
        const newProduct = new Product({ name, price, category, description });
        await newProduct.save();
        res.status(201).json(newProduct);
    }
    catch(error){
        res.status(400).json({ message: error.message });
    }
});

export default router;