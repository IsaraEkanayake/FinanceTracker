const cron = require("node-cron");
const Transaction = require("../models/transaction.model");
const Goal = require("../models/goal.model");

const createTransaction = async (data) => {
  return await Transaction.create(data);
};

const getAllTransactions = async () => {
  return await Transaction.find();
};

const getTransactionById = async (id) => {
  return await Transaction.findById(id);
};

const updateTransaction = async (id, data) => {
  return await Transaction.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const deleteTransaction = async (id) => {
  return await Transaction.findByIdAndDelete(id);
};

// Filter Transactions by Tags
const filterTransactionsByTags = async (tags) => {
  return await Transaction.find({ tags: { $in: tags } });
};

// Sort Transactions by Date (Ascending or Descending)
const sortTransactionsByDate = async (order = "asc") => {
  return await Transaction.find().sort({ date: order === "asc" ? 1 : -1 });
};

const updateTransactionTags = async (id, tags) => {
  return await Transaction.findByIdAndUpdate(id, { tags }, { new: true, runValidators: true });
};

// Function to process recurring transactions
// const processRecurringTransactions = async () => {
//   const today = new Date();
  
//   // Find all recurring transactions that should run today
//   const recurringTransactions = await Transaction.find({
//     isRecurring: true,
//     endDate: { $gte: today }, // Transactions that haven't ended
//   });

//   for (const transaction of recurringTransactions) {
//     const lastTransactionDate = new Date(transaction.date);
//     let nextTransactionDate = new Date(lastTransactionDate);

//     // Calculate next transaction date based on recurrencePattern
//     switch (transaction.recurrencePattern) {
//       case "daily":
//         nextTransactionDate.setDate(lastTransactionDate.getDate() + 1);
//         break;
//       case "weekly":
//         nextTransactionDate.setDate(lastTransactionDate.getDate() + 7);
//         break;
//       case "monthly":
//         nextTransactionDate.setMonth(lastTransactionDate.getMonth() + 1);
//         break;
//     }

//     if (nextTransactionDate <= today) { 
//       // Clone the transaction with updated date
//       const newTransaction = new Transaction({
//         ...transaction.toObject(),
//         _id: undefined, // Ensure a new transaction is created
//         date: nextTransactionDate,
//       });

//       await newTransaction.save();
//       console.log(`✅ Recurring transaction created for ${transaction.category}`);
//     }
//   }
// };

// // Schedule cron job to run every minute
// cron.schedule("* * * * *", async () => {
//   console.log("🔄 Checking for recurring transactions...");
//   await processRecurringTransactions();
// });

const generateFinancialReport = async (filters) => {
  const { startDate, endDate, category, tags, currency = "LKR" } = filters;
  
  let query = {};

  if (startDate && endDate) {
    query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  if (category) {
    query.category = category;
  }

  if (tags) {
    query.tags = { $in: tags.split(",") }; // Expecting comma-separated tags
  }

  const transactions = await Transaction.find(query);

  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === "income") {
      totalIncome += transaction.amount;
    } else if (transaction.type === "expense") {
      totalExpenses += transaction.amount;
    }
  });

  const balance = totalIncome - totalExpenses;

  // Define conversion rates
  const conversionRates = {
    LKR: 1, // Default
    USD: 1 / 300, // Convert from LKR to USD
    EUR: 1 / 320, // Convert from LKR to EUR
  };

  // Check if the requested currency is supported
  if (!conversionRates[currency]) {
    return {
      error: "Currency not supported",
      supportedCurrencies: Object.keys(conversionRates),
    };
  }

  // Convert amounts based on selected currency
  const exchangeRate = conversionRates[currency];
  const convertedTotalIncome = (totalIncome * exchangeRate).toFixed(2);
  const convertedTotalExpenses = (totalExpenses * exchangeRate).toFixed(2);
  const convertedBalance = (balance * exchangeRate).toFixed(2);

  return {
    currency, // Show selected currency
    totalIncome: convertedTotalIncome,
    totalExpenses: convertedTotalExpenses,
    balance: convertedBalance,
    transactions: transactions.map((t) => ({
      ...t.toObject(),
      amount: (t.amount * exchangeRate).toFixed(2),
    })),
  };
};


const calculateMonthlyBudget = async (budget, month, year) => {
  const startDate = new Date(year, month - 1, 1); // First day of the month
  const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of the month

  // Fetch all transactions within the specified month
  const transactions = await Transaction.find({
    date: { $gte: startDate, $lte: endDate },
  });

  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === "income") {
      totalIncome += transaction.amount;
    } else if (transaction.type === "expense") {
      totalExpenses += transaction.amount;
    }
  });

  const remainingBudget = budget - totalExpenses;
  const budgetExceeded = remainingBudget < 0;

  let recommendation = "You are within budget!";
  if (budgetExceeded) {
    recommendation = `Budget exceeded by ${Math.abs(remainingBudget)}. Consider reducing expenses in non-essential categories.`;
  } else if (remainingBudget < budget * 0.2) {
    recommendation = `You are nearing your budget limit. Remaining: ${remainingBudget}`;
  }

  return {
    totalIncome,
    totalExpenses,
    remainingBudget,
    budgetExceeded,
    recommendation,
  };
};

const trackSavingsProgress = async (userId) => {
  const goals = await Goal.find({ userId });

  const progress = goals.map((goal) => {
    const percentageSaved = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(2);
    return {
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      percentageSaved: percentageSaved + "%",
      deadline: goal.deadline,
      status: goal.currentAmount >= goal.targetAmount ? "Goal Achieved" : "In Progress",
    };
  });

  return progress;
};

const allocateSavingsAutomatically = async (transaction) => {
  if (transaction.type !== "income") return; // Only allocate from income

  const goals = await Goal.find({ userId: transaction.userId, autoAllocate: true });

  for (const goal of goals) {
    const allocationAmount = (transaction.amount * goal.allocationPercentage) / 100;

    if (goal.currentAmount + allocationAmount <= goal.targetAmount) {
      goal.currentAmount += allocationAmount;
      await goal.save();
    }
  }
};


module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  filterTransactionsByTags,
  sortTransactionsByDate,
  updateTransactionTags,
  generateFinancialReport,
  calculateMonthlyBudget, // Added new function
  trackSavingsProgress,
  allocateSavingsAutomatically,
  
};
