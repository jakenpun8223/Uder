import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Table from '../models/Table.js';

// [WAITER] create new order for table 
export const createOrder = async (req,res) => {
    try{
        const { tableNumber, items } = req.body;
        // items expected format: [{ product: "productId", quantity: 2 }]

        // VALIDATION: Does this table exist?
        const table = await Table.findOne({ tableNumber });
        if(!table){
            return res.status(404).json({ message: `Table ${tableNumber} does not exist in system.` });
        }

        // VALIDATION: Is it already occupied?
        if(table.status === 'occupied'){
            return res.status(400).json({ message: `Table ${tableNumber} is already occupied. Add items to the existing order instead.` });
        }

        let totalAmount = 0;
        const finalItems = [];

        //Fetch real prices from DB to be scure
        for (const item of items){
            const productDoc = await Product.findById(item.product);
            if(productDoc){
                finalItems.push({
                    product: productDoc._id,
                    quantity: item.quantity,
                    name: productDoc.name, // Snapshot name in case it changes later
                    price: productDoc.price
                });
                totalAmount += productDoc.price * item.quantity;
            }
        }

        const newOrder = new Order({
            tableNumber,
            items: finalItems,
            totalAmount
        });
        await newOrder.save();

        // CRITICAL: Mark as Occupied
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

        const order = await Order.findById(id);
        if(!order) return res.status(404).json({ message: "Order not found" });

        // Calculate and push new items
        for (const item of items){
            const productDoc = await Product.findById(item.product);
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
        const orders = await Order.find()
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
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('items.product'); // Populate so the frontend gets full product details back

        if (!order) return res.status(404).json({ message: "Order not found" });

        // --- NEW: EMIT UPDATE ---
        const io = req.app.get('socketio'); 
        io.emit('order_updated', order);
        // ------------------------

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};