import Order from '../models/Order.js'
import Product from '../models/Product.js'

// [WAITER] create new order for table 
export const createOrder = async (req,res) => {
    try{
        const {kq, tableNumber, items } = req.body;
        // items expected format: [{ product: "productId", quantity: 2 }]

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
        res.status(201).json(newOrder);
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
}
