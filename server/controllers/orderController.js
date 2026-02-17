import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Table from '../models/Table.js';

// [WAITER] create new order for table 
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

        // --- NEW LOGIC: APPEND IF OCCUPIED ---
        if(table.status === 'occupied' && table.currentOrder){
            // 1. Find the existing order
            const existingOrder = await Order.findById(table.currentOrder);
            
            if(existingOrder) {
                // 2. Add new items to it
                for (const item of items){
                    const productDoc = await Product.findOne({ 
                        _id: item.product, 
                        restaurant: req.user.restaurant 
                    });

                    if(productDoc){
                        existingOrder.items.push({
                            product: productDoc._id,
                            quantity: item.quantity,
                            name: productDoc.name,
                            price: productDoc.price
                        });
                        existingOrder.totalAmount += productDoc.price * item.quantity;
                    }
                }
                
                await existingOrder.save();

                // 3. Emit update
                const io = req.app.get('socketio');
                io.to(req.user.restaurant).emit('order_updated', existingOrder);

                return res.status(200).json(existingOrder);
            }
            // If active order missing (data corruption), fall through to create new one
        }
        // -------------------------------------

        let totalAmount = 0;
        const finalItems = [];

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

        const newOrder = new Order({
            tableNumber,
            items: finalItems,
            totalAmount,
            restaurant: req.user.restaurant
        });
        await newOrder.save();

        const io = req.app.get('socketio');
        io.to(req.user.restaurant).emit('new_order', newOrder); 

        table.status = 'occupied';
        table.currentOrder = newOrder._id;
        await table.save();
        
        res.status(201).json(newOrder);
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
}

// [WAITER] Add items to an existing order (e.g. Table wants desert)
export const addItemsToOrder = async (req,res) => {
    try{
        const { id } = req.params; // Order ID
        const { items } = req.body; // New items to add

        const order = await Order.findOne({ _id: id, restaurant: req.user.restaurant });
        if(!order) return res.status(404).json({ message: "Order not found" });

        // Calculate and push new items
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

        order.version = (order.version || 1) + 1; // Track changes
        await order.save();

        res.json(order);
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
};

// [KITCHEN / WAITER] Get all orders
export const getAllOrders = async (req,res) => {
    try{
        // Return all orders sorted by newest first
        // Populate 'product' to get details like allergies/category
        const orders = await Order.find({ restaurant: req.user.restaurant })
            .sort({ createdAt: -1 })
            .populate('items.product');
        res.json(orders);
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
};

// [CHEF / CASHIER] Update status (Pending -> Preparing -> Served -> Paid)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, restaurant: req.user.restaurant },
            { status },
            { new: true }
        ).populate('items.product'); // Populate so the frontend gets full product details back

        if (!order) return res.status(404).json({ message: "Order not found" });

        // --- NEW: EMIT UPDATE ---
        const io = req.app.get('socketio');
        io.to(req.user.restaurant).emit('order_updated', order);
        // ------------------------

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};