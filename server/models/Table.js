import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'reserved'],
        default: 'available'
    },
    needsAssistance: {
        type: Boolean,
        default: false
    },
    currentOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
        index: true // Important for performance!
    }
}, { timestamps: true });

export default mongoose.model('Table', tableSchema);