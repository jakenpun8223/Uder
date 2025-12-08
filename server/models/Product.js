import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Main','Sushi'], // should be dynamic
    },
    description: {
        type: String
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    alergies: [{
        required: true,
        enum: ['lactos', 'gluten', 'shellfish', 'penut', 'nuts', 'soy'] // TODO: add relevts and do a spell check
    }],
    ingridiants: [{// helpful if we want to give the ability to write to the system 'we are out of chicken' and all chicken products will be turned off.
        required: true,
        type: String,
    }]
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;