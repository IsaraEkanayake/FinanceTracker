const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["income", "expense"], required: true },
  userId:{type :String},
  amount: { type: Number, required: true },
  category: { type: String,enum:["Food","Transportation","Entertainment"], default: "Not set" },
  tags: { type: [String],enum :["vacation","work","utilities"], default: [] }, // Allowing custom tags
  date: { type: Date, default: Date.now },
  isRecurring: { type: Boolean, default: false },
  recurrencePattern: { 
    type: String, 
    enum: ["daily", "weekly", "monthly", "Not set"], 
    default: "Not set" 
  },
  endDate: { type: Date, default: null },
});

module.exports = mongoose.model("Transaction", transactionSchema);
