const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Function to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Function to compare passwords
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Register User
exports.registerUser = async ({ fullName, email, phone, password,role, imageurl }) => {
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return { success: false, message: "Email already in use" };
    }

    const hashedPassword = await hashPassword(password); // 🔹 Fixed hashPassword call

    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword, // Store hashed password
      role,
      imageurl,
    });

    await newUser.save();
    return { success: true, message: "User registered successfully" };
  } catch (error) {
    return { success: false, message: "Registration failed", error: error.message };
  }
};

// Login User
exports.loginUser = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const isMatch = await comparePassword(password, user.password); // 🔹 Fixed comparePassword call
    if (!isMatch) {
      return { success: false, message: "Invalid credentials" };
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return { success: true, message: "Login successful", user, token };
  } catch (error) {
    return { success: false, message: "Login failed", error: error.message };
  }
};

// Export Password Functions
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword; 
