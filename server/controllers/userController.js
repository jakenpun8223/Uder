import user from "../models/User.js";
import bcrypt from "bcrypt";

export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users and exclude passwords
    const users = await user.find({ restaurant: req.user.restaurant }).select("-password");

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
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "manager" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const managerRestaurantId = req.user.restaurant;

    if (!managerRestaurantId) {
      return res.status(400).json({
        message: "Critical Error: You are not linked to a restaurant."
      });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedEmail = email.toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hash = await bcrypt.hash(password, 10);

    const newStaff = await User.create({
      name,
      email: normalizedEmail,
      password: hash,
      role: role || "staff",
      restaurant: managerRestaurantId
    });

    res.status(201).json({
      message: "Staff created successfully",
      user: { id: newStaff._id, name: newStaff.name }
    });

  } catch (error) {
    console.error("Create staff error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
