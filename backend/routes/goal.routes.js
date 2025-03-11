const express = require("express");
const router = express.Router();
const goalController = require("../controlers/goal.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// 🔒 User-specific routes
router.post("/create", verifyToken, goalController.createGoal);
router.put("/update/:id", verifyToken, goalController.updateGoal);
router.get("/get", verifyToken, goalController.getGoals);

module.exports = router;
