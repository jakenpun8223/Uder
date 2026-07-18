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

// REAL CLEARING COMPANY INTEGRATION (Mocked for school presentation)
export const generatePaymentLink = async (req, res) => {
    try {
        const { tableNumber, amount } = req.body;
        const restaurantId = req.user.restaurant;

        // 1. Verify the table has active orders
        const activeOrders = await Order.find({ 
            tableNumber, 
            restaurant: restaurantId,
            status: { $in: ['pending', 'preparing', 'ready', 'served'] } 
        });

        if (activeOrders.length === 0) {
             return res.status(400).json({ message: "No active orders found for this table." });
        }

        // ==========================================
        // REAL WORLD "חברת סליקה" API CALL GOES HERE
        // ==========================================
        /* // Example using an Israeli Provider API (e.g., PayPlus / Meshulam)
        
        const clearingResponse = await axios.post('https://api.israel-clearing.co.il/v1/generate-page', {
            api_key: process.env.CLEARING_API_KEY,
            amount: amount,
            currency: 'ILS',
            description: `Payment for Table ${tableNumber}`,
            success_url: `http://localhost:5173/waiter?payment=success&table=${tableNumber}`,
            cancel_url: `http://localhost:5173/waiter?payment=cancel`
        });
        
        const paymentUrl = clearingResponse.data.page_url; 
        */
        
        // ==========================================
        // MOCK API FOR SCHOOL PRESENTATION
        // ==========================================
        // We will simulate the Clearing Company returning a secure link.
        // For the presentation, we can redirect them to a fake success page, or back to the Waiter Dashboard with a success query parameter.
        const mockPaymentUrl = `/waiter?simulatedPayment=true&table=${tableNumber}&amount=${amount}`;
        
        res.json({ paymentUrl: mockPaymentUrl });

    } catch (error) {
        console.error("Payment API Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// We also need the function that the Clearing Company calls when payment is SUCCESSFUL.
// In real life, the clearing company sends a "Webhook" to this route.
export const closeTableAfterPayment = async (req, res) => {
    try {
        const { tableNumber } = req.body;
        const restaurantId = req.user.restaurant;

        const table = await Table.findOne({ tableNumber, restaurant: restaurantId });
        
        const activeOrders = await Order.find({ 
            tableNumber, 
            restaurant: restaurantId,
            status: { $in: ['pending', 'preparing', 'ready', 'served'] } 
        });

        // Mark all orders as paid
        for (let order of activeOrders) {
            order.status = 'paid';
            await order.save();
        }

        // Free up the table
        if (table) {
            table.status = 'available';
            table.currentOrder = null;
            await table.save();
        }

        // Emit socket events so the screen updates instantly
        const io = req.app.get('socketio');
        const room = restaurantId.toString();
        io.to(room).emit('table_updated', table);
        activeOrders.forEach(o => io.to(room).emit('order_updated', o)); 

        res.json({ message: `Table ${tableNumber} successfully closed.` });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};