import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: true,
        min: 1
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1
            },
            // Store name/price snapshot in case menu changes later
            name: String,
            price: Number
        }
    ],
    version: { // if table wants to add to the order later
        type: Number,
        default: 1,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'preparing', 'ready', 'served', 'paid', 'cancelled'], // Added 'ready' and 'cancelled'
        default: 'pending'
    }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);