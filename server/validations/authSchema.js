import { z } from "zod";

export const registerSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" })
    .trim(),
  
  email: z.string()
    .email({ message: "Invalid email address" })
    .trim()
    .toLowerCase(),
  
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[!@#$%^&*]/, { message: "Password must contain at least one special character" }),
});

export const loginSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address" })
    .trim()
    .toLowerCase(),
  
  password: z.string()
    .min(1, { message: "Password is required" }),
});