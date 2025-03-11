const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Associate with a user
  title: { type: String, required: true }, // Goal name
  targetAmount: { type: Number, required: true }, // Total amount needed
  currentAmount: { type: Number, default: 0 }, // Amount saved so far
  deadline: { type: Date, required: true }, // Deadline for the goal
  autoAllocate: { type: Boolean, default: false }, // Whether to auto-allocate savings
  allocationPercentage: { type: Number, default: 0 }, // % of income to allocate
});

module.exports = mongoose.model("Goal", goalSchema);
