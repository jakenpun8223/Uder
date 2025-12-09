import express from 'express';
import Table from '../models/Table.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all tables (For Waiters Dashboard to see what`s free)
router.get('/', protect, async (req,res) => {
    try{
        const tables = await Table.find().sort({ tableNumber: 1 });
        res.json(tables);
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
});

// Create a Table (Admin Only - Setup)
router.post('/', protect, authorize('admin'), async (req,res) => {
    try{
        const { tableNumber, capacity } = req.body;
        const existingTable = await Table.findOne({ tableNumber });
        if(existingTable) return res.status(400).json({ message: "Table already exists" });

        const newTable = new Table.create({ tableNumber, capacity });
        res.status(201).json(newTable);
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
});

// Clear/Free a Table (When customer leave)
router.patch('/:id/free', protect, authorize('admin', 'staff'), async (req,res) => {
    try{
        const table = await Table.findById(req.params.id);
        if(!table) return res.status(404).json({ message: "Table not found" });

        table.status = 'available';
        table.currentOrder = null;
        await table.save();
        res.json(table);
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
});

export default router;