import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['Main', 'Sushi', 'Drinks', 'Dessert', 'Starters'],
    },
    description: {
        type: String,
        trim: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    allergens: [{
        type: String,
        enum: ['lactose', 'gluten', 'shellfish', 'peanut', 'nuts', 'soy', 'eggs', 'fish', 'sesame']
    }],
    ingredients: [{ 
        type: String,
        trim: true,
        required: true 
    }]
}, { timestamps: true });

export default mongoose.model('Product', productSchema);