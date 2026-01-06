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
            name: String, // Snapshot of product name
            price: Number // Snapshot of product price
        }
    ],
    version: {
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
        enum: ['pending', 'preparing', 'ready', 'served', 'paid', 'cancelled'],
        default: 'pending'
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
        index: true // Important for performance!
    }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);