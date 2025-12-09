import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Critical for DB integrity
        trim: true,
        lowercase: true,
    }, 
    password: {
        type: String,
        required: true,
        // Note: No length/complexity validation here because this stores the HASH, not the plain text.
    },
    role: {
        type: String,
        enum: ['admin', 'staff', 'kitchen'],
        default: 'staff' // Default role is staff
    }
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            delete ret.password; // Never send password hash to frontend
            return ret;
        }
    },
    toObject: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    }
});

export default mongoose.model('User', userSchema);