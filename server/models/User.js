import mongoose from "mongoose";
import bcrypt from 'bcrypt';

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
    // Link to the Restaurant model
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        default: null
    },
    role: {
        type: String,
        enum: ['admin', 'staff', 'kitchen', 'user'],
        default: 'user' // Default role is user
    },
    // For staff requesting to join
    joinRequestStatus: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none'
    },
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            delete ret.password; // Never send password hash to frontend
            delete ret.__v;      // Remove version key
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

// Encrypted password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

export default mongoose.model('User', userSchema);