import bcrypt from "bcrypt";
import User from "../models/user.model.js";
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
      passwordHash
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
    const result = loginSchema.parse(req.body);
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
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if(!isMatch){
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      user
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
