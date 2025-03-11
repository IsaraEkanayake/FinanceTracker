const authService = require("../services/auth.service");

exports.register = async (req, res) => {
  try {
    const { fullName, email,phone, password,role, imageurl } = req.body;
    const response = await authService.registerUser({ fullName, email, phone, password,role, imageurl });

    if (!response.success) {
      return res.status(400).json({ message: response.message, success: false });
    }

    return res.status(201).json({ message: "User Registered Successfully!", success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await authService.loginUser(email, password);

    if (!response.success) {
      return res.status(401).json({ message: response.message, success: false });
    }

    return res.status(200).json({
      success: true,
      message: "User login successful",
      user: response.user,
      token: response.token,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message, success: false });
  }
};
