import mongoose from "mongoose";
import { lowercase } from "zod";

const userSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
        }, 
        password: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                delete ret.password;
                return ret;
            }
        },
        toObject: {
            transform(doc, ret) {
                delete ret.password;
                return ret;
            }
        }
    }
);

export default mongoose.model('user', userSchema);