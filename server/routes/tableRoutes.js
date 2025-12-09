import express from 'express';
import Table from '../models/Table.js';
import Order from '../models/Order.js'; // Import Order model if you need to populate deep details
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// [WAITER] Clear Notification (When waiter arrives)
router.post('/:tableNumber/resolve-assistance', protect, async (req, res) => {
    try {
        const { tableNumber } = req.params;
        const table = await Table.findOne({ tableNumber });
        
        if (!table) return res.status(404).json({ message: "Table not found" });

        table.needsAssistance = false;
        await table.save();

        // Optional: Tell other waiters it's handled
        const io = req.app.get('socketio');
        io.emit('table_resolved', { tableNumber });

        res.json({ message: "Assistance request cleared" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// [CUSTOMER] Call Waiter (Public - No Login Required)
router.post('/:tableNumber/request-assistance', async (req, res) => {
    try {
        const { tableNumber } = req.params;
        const table = await Table.findOne({ tableNumber });
        
        if (!table) return res.status(404).json({ message: "Table not found" });

        // Update DB
        table.needsAssistance = true;
        await table.save();

        // Send Real-Time Notification to Waiters
        const io = req.app.get('socketio'); // Get io instance
        io.emit('table_calling', { tableNumber, message: `Table ${tableNumber} needs help!` });

        res.json({ message: "Waiter has been notified" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// [WAITER] Get details for a specific table (e.g., Scan QR -> Get Table 5 Status)
router.get('/:tableNumber', protect, async (req, res) => {
    try {
        const { tableNumber } = req.params;
        
        // Find table and populate the active order details
        const table = await Table.findOne({ tableNumber })
            .populate({
                path: 'currentOrder',
                populate: { path: 'items.product' } // Show product names in the order
            });

        if (!table) {
            return res.status(404).json({ message: "Table not found" });
        }

        res.json(table);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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