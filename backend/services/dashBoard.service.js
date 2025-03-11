const User = require("../models/user.model");
const Transaction = require("../models/transaction.model");
const Goal = require("../models/goal.model");

const getAdminDashboard = async () => {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();

    const incomeSum = await Transaction.aggregate([
        { $match: { type: { $in: ["income", "Income", "INCOME"] } } }, // Handle case-sensitivity
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const expenseSum = await Transaction.aggregate([
        { $match: { type: { $in: ["expense", "Expense", "EXPENSE"] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    return {
        totalUsers,
        totalTransactions,
        totalIncome: incomeSum.length > 0 ? incomeSum[0].total : 0,
        totalExpenses: expenseSum.length > 0 ? expenseSum[0].total : 0,
        systemBalance: (incomeSum.length > 0 ? incomeSum[0].total : 0) - (expenseSum.length > 0 ? expenseSum[0].total : 0)
    };
};
const getUserDashboard = async (userId) => {
    const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(5);
    const totalIncome = await Transaction.aggregate([
        { $match: { userId, type: "income" } },
        
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalExpenses = await Transaction.aggregate([
        { $match: { userId, type: "expense" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const goals = await Goal.find({ userId });

    return {
        recentTransactions: transactions,
        totalIncome: totalIncome[0]?.total || 0,
        totalExpenses: totalExpenses[0]?.total || 0,
        balance: (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0),
        goals
    };
};

module.exports = { getAdminDashboard, getUserDashboard };
