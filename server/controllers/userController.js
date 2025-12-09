import user from "../models/User.js";

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
