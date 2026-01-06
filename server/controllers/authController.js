import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import User from "../models/User.js";
import { registerSchema, loginSchema } from "../validations/authSchema.js";
import Restaurant from "../models/Restaurant.js";

// Generate JWT and save to Cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id, role: user.role, restaurant: user.restaurant }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    httpOnly: true, // Prevents XSS attacks (cannot be accessed by JS)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict' // CSRF protection
  };

  res.status(statusCode)
    .cookie('jwt', token, cookieOptions)
    .json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurant: user.restaurant
      }
    });
};

export const register = async (req, res) => {
  try {
    // 1. Validate Input (We need restaurantName now)
    // Note: Update your Zod schema to include 'restaurantName'
    const { name, email, password, restaurantName } = req.body;

    // 2. Check if Email Already Exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    // 3. Create the Restaurant First
    // (Optional: Check if restaurantName exists if you want unique names)
    const newRestaurant = await Restaurant.create({
        name: restaurantName || `${name}'s Restaurant`
    });

    // 4. Create the Manager User linked to this Restaurant
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: passwordHash,
      role: 'admin', // The person registering is the Admin/Manager
      restaurant: newRestaurant._id // <--- Link to the new restaurant
    });

    // 5. Link owner back to restaurant (Optional but good for ref)
    newRestaurant.owner = user._id;
    await newRestaurant.save();

    // 6. Send Token
    sendTokenResponse(user, 201, res);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
// export const register = async (req, res) => {
//   try {
//     // 1. Validate Input (Zod)
//     const result = registerSchema.safeParse(req.body);
//     if (!result.success) {
//       // Safely try to get the first error message, fallback to a generic one
//       const errorMessage = result.error.errors?.[0]?.message || "Invalid registration data";
//       return res.status(400).json({ error: errorMessage });
//     }

//     const { name, email, password } = result.data;

//     // 2. Check existing user
//     const existingUser = await User.findOne({ email });
//     if(existingUser){
//       return res.status(400).json({ error: 'Email already exists'});
//     }

//     // 3. Hash Password
//     const salt = await bcrypt.genSalt(10);
//     const passwordHash = await bcrypt.hash(password, salt);

//     // 4. Create User (Default role is 'staff' from Schema)
//     const user = await User.create({
//       name,
//       email,
//       password: passwordHash
//     });

//     // 5. Send Token
//     sendTokenResponse(user, 201, res);

//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

export const login = async (req, res) => {
  try {
    // 1. Validate Input
    const result = loginSchema.safeParse(req.body);
    if(!result.success){
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const { email, password } = result.data;

    // 2. Check User & Password
    const user = await User.findOne({ email }).select('+password'); // Select password explicitly if needed
    if(!user){
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Send Token
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const logout = (req, res) => {
  res.cookie('jwt', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, data: {} });
};

// Check if user is logged in and return their info
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};