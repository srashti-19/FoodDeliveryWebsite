import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // ✅ Added missing bcrypt import
import validator from "validator";
import dotenv from "dotenv"; // ✅ Added dotenv import for environment variables

dotenv.config(); // ✅ Configured dotenv

// Function to create JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" }); // ✅ Added expiration time for security
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User doesn't exist" }); // ✅ Changed response status to 404
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" }); // ✅ Changed response status to 401
    }

    const token = createToken(user._id);
    res.status(200).json({ success: true, token }); // ✅ Changed response status to 200
  } catch (error) {
    console.error(error); // ✅ Used console.error for better debugging
    res.status(500).json({ success: false, message: "Server error" }); // ✅ Changed generic error message
  }
};

// Register User
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;

  try {
    // Check if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "User already exists" }); // ✅ Changed response status to 400
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email" }); // ✅ Changed response status to 400
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" }); // ✅ Changed response status to 400
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    res.status(201).json({ success: true, token }); // ✅ Changed response status to 201 for successful resource creation
  } catch (error) {
    console.error(error); // ✅ Used console.error for better debugging
    res.status(500).json({ success: false, message: "Server error" }); // ✅ Changed generic error message
  }
};

export { loginUser, registerUser };
