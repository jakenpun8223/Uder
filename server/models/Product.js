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
        min: 0 // Prevent negative prices
    },
    category: {
        type: String,
        required: true,
        enum: ['Main', 'Sushi', 'Drinks', 'Dessert', 'Starters'], // Expanded categories
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
        enum: ['lactose', 'gluten', 'shellfish', 'peanut', 'nuts', 'soy', 'eggs', 'fish', 'sesame'] // Corrected spelling
    }],
    ingredients: [{ 
        type: String,
        trim: true
    }]
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;