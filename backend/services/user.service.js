const Users = require("../models/user.model");
const { hashPassword } = require("../utils/hash.util");

exports.registerUser = async (userData) => {
  // Check if user already exists
  const userExists = await Users.findOne({ email: userData.email });
  if (userExists) {
    throw new Error("This email already exists");
  }

  // Hash the password
  userData.password = await hashPassword(userData.password);

  // Create new user
  const newUser = new Users(userData);
  await newUser.save();

  return { message: "User Registered Successfully!", success: true };
};
