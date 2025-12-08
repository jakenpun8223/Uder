import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: true
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
                default: 1
            },
            // Store name/price snapshot in case menu changes later
            name: String,
            price: Number
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'preparing', 'served', 'paid'],
        default: 'pending'
    }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);