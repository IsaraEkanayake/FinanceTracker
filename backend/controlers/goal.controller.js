const Goal = require("../models/goal.model");
const responseHandler = require("../utils/responseHeader");

const createGoal = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User ID is missing" });
    }

    const goal = new Goal({ userId: req.user.id, ...req.body });
    const savedGoal = await goal.save(); // Ensure this properly resolves

    res.status(200).json({
      message: "Goal created successfully",
      data: savedGoal,
    });
  } catch (error) {
    next(error);
  }
};

  
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!goal) return responseHandler.error(res, "Goal not found", 404);
    responseHandler.success(res, "Goal updated successfully", goal);
  } catch (error) {
    next(error);
  }
};

const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user.id });
    responseHandler.success(res, "Goals retrieved successfully", goals);
  } catch (error) {
    next(error);
  }
};

module.exports = { createGoal, updateGoal, getGoals };
