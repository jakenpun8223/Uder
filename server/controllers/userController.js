import user from "../models/User.js";
import bcrypt from "bcrypt";

export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users and exclude passwords
    const users = await user.find().select("-password");

    return res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// POST /api/users/staff
export const createStaffUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Security Check: Only Admins can do this (handled by middleware usually)
        // AND ensuring we use the requester's restaurant ID
        const managerRestaurantId = req.user.restaurant; // From Auth Middleware

        // Check if user exists
        const existing = await User.findOne({ email });
        if(existing) return res.status(400).json({ message: "Email already in use" });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const newStaff = await User.create({
            name,
            email,
            password: hash,
            role: role || 'staff', // 'staff' or 'kitchen'
            restaurant: managerRestaurantId // <--- AUTO-ASSIGNED
        });

        res.status(201).json({ message: "Staff created successfully", user: { id: newStaff._id, name: newStaff.name } });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};