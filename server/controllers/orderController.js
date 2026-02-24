import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Table from '../models/Table.js';

// [WAITER] Create new order (Always creates a separate Ticket)
export const createOrder = async (req,res) => {
    try{
        const { tableNumber, items } = req.body;

        const table = await Table.findOne({ 
            tableNumber, 
            restaurant: req.user.restaurant 
        });

        if(!table){
            return res.status(404).json({ message: `Table ${tableNumber} does not exist.` });
        }

        // --- DELETED: The logic that appended to existing orders ---
        // We now skip directly to creating a NEW order every time.
        // -----------------------------------------------------------

        let totalAmount = 0;
        const finalItems = [];

        // 1. Calculate totals and format items
        for (const item of items){
            const productDoc = await Product.findOne({ 
                _id: item.product, 
                restaurant: req.user.restaurant 
            });

            if(productDoc){
                finalItems.push({
                    product: productDoc._id,
                    quantity: item.quantity,
                    name: productDoc.name,
                    price: productDoc.price
                });
                totalAmount += productDoc.price * item.quantity;
            }
        }

        // 2. Always create a NEW Order document
        const newOrder = new Order({
            tableNumber,
            items: finalItems,
            totalAmount,
            restaurant: req.user.restaurant,
            status: 'pending' // Default status
        });
        await newOrder.save();

        // 3. Emit 'new_order' so Kitchen sees a FRESH ticket
        const io = req.app.get('socketio');
        // Ensure room ID is a string
        const room = req.user.restaurant.toString();
        io.to(room).emit('new_order', newOrder); 

        // 4. Update Table Status
        // We set it to occupied. We update currentOrder to the LATEST ticket.
        table.status = 'occupied';
        table.currentOrder = newOrder._id; 
        await table.save();
        
        res.status(201).json(newOrder);
    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

// ... (Keep existing addItemsToOrder, getAllOrders, updateOrderStatus) ...
export const addItemsToOrder = async (req,res) => {
    // ... existing code ...
    try{
        const { id } = req.params;
        const { items } = req.body;
        const order = await Order.findOne({ _id: id, restaurant: req.user.restaurant });
        if(!order) return res.status(404).json({ message: "Order not found" });

        for (const item of items){
            const productDoc = await Product.findOne({ _id: item.product, restaurant: req.user.restaurant });
            if(productDoc){
                order.items.push({
                    product: productDoc._id,
                    quantity: item.quantity,
                    name: productDoc.name,
                    price: productDoc.price
                });
                order.totalAmount += productDoc.price * item.quantity;
            }
        }
        order.version = (order.version || 1) + 1;
        await order.save();
        res.json(order);
    } catch(error){ res.status(500).json({ message: error.message }); }
};

export const getAllOrders = async (req,res) => {
    try{
        const orders = await Order.find({ restaurant: req.user.restaurant })
            .sort({ createdAt: 1 })
            .populate('items.product');
        res.json(orders);
    } catch(error){ res.status(500).json({ message: error.message }); }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, restaurant: req.user.restaurant },
            { status },
            { new: true }
        ).populate('items.product');

        if (!order) return res.status(404).json({ message: "Order not found" });

        const io = req.app.get('socketio');
        const room = req.user.restaurant.toString();
        io.to(room).emit('order_updated', order);

        res.json(order);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// Add new function
export const closeTableAndPay = async (req, res) => {
    try {
        const { tableNumber, paymentMethod } = req.body; // paymentMethod could be 'VISA', 'CASH'
        const restaurantId = req.user.restaurant;

        // 1. Find the table
        const table = await Table.findOne({ tableNumber, restaurant: restaurantId });
        if (!table) return res.status(404).json({ message: "Table not found" });

        // 2. Find all active orders for this table
        const activeOrders = await Order.find({ 
            tableNumber, 
            restaurant: restaurantId,
            status: { $in: ['pending', 'preparing', 'ready', 'served'] } 
        });

        if (activeOrders.length === 0) {
             return res.status(400).json({ message: "No active orders found for this table." });
        }

        // 3. Mark all orders as 'paid'
        for (let order of activeOrders) {
            order.status = 'paid';
            await order.save();
        }

        // 4. Update Table status back to 'available'
        table.status = 'available';
        table.currentOrder = null;
        await table.save();

        // 5. Emit socket events
        const io = req.app.get('socketio');
        const room = restaurantId.toString();
        io.to(room).emit('table_updated', table);
        // You might want to emit an event to clear orders from the waiter's view
        activeOrders.forEach(o => io.to(room).emit('order_updated', o)); 

        res.json({ message: `Table ${tableNumber} closed successfully. Payment processed via ${paymentMethod}.` });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};