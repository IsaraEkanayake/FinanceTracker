const express = require("express");
const router = express.Router();
const authController = require("../controlers/auth.controller"); // Check this import!

// Register Route
router.post("/register", authController.register);

// Login Route
router.post("/login", authController.login); // Ensure `login` function exists in auth.controller.js

module.exports = router;

