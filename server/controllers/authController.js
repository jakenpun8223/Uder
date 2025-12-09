import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import User from "../models/User.js";
import { registerSchema, loginSchema } from "../validations/authSchema.js";

const SALT_ROUNDS = 10; // >= 10 as required

export const register = async (req, res) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if(!result.success){
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors.map(e => e.message)
      });
    }

    const { name, email, password } = result.data;

    const existingUser = await User.findOne({ email }); 
    if(existingUser){
      return res.status(409).json({ error: 'Email already exist'});
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email,
      password: passwordHash
    });

    return res
      .status(201)
      .json({ message: 'User registered successfully', user});
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    // Validate input
    const result = loginSchema.safeParse(req.body);
    if(!result.success){
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors.map(e => e.message)
      });
    }

    const { email, password } = result.data;

    // Find user check
    const user = await User.findOne({ email });
    if(!user){
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if(!process.env.JWT_SECRET){
      throw new Error("FATAL ERROR: JWT_SECRET is not defined.");
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
