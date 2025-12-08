import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { registerSchema, loginSchema } from "../validations/auth.schema.js";
import { ZodError } from "zod";

const SALT_ROUNDS = 10; // >= 10 as required

export const register = async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if(!parsed.success){
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors.map(e => e.message)
      });
    }

    const { name, email, password } = parsed.data;

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
  } catch (err) {
    if (err instanceof ZodError) {
      const issues = err.errors
        ? err.errors.map((e) => ({ path: e.path, message: e.message }))
        : [];
      return res
        .status(400)
        .json({ success: false, error: "Validation failed", issues });
    }

    console.log("register failiar");
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const { email, password } = parsed;

    const user = await User.findOne({ email });
    if (!user) {
      // generic message to avoid leaking existence - if user doesnt exists
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    //compare the password to the hash
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    const safeUser = { id: user._id, name: user.name, email: user.email };
    return res
      .status(200)
      .json({ success: true, message: "Login successful", user: safeUser });
  } catch (err) {
    if (err instanceof ZodError) {
      const issues = err.errors
        ? err.errors.map((e) => ({ path: e.path, message: e.message }))
        : [];
      return res
        .status(400)
        .json({ success: false, error: "Validation failed", issues });
    }

    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
