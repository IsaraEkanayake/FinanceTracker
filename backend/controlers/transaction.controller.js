const transactionService = require("../services/transaction.service");
const responseHandler = require("../utils/responseHeader");

const createTransaction = async (req, res, next) => {
  try {
    // Ensure user ID is set from the token
    const userId = req.user.id;  

    // Merge userId into the transaction data
    const transactionData = {
      ...req.body,
      userId, // Attach user ID from the token
    };

    const transaction = await transactionService.createTransaction(transactionData);
    responseHandler.success(res, "Transaction created successfully", transaction);
  } catch (error) {
    next(error);
  }
};

const getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await transactionService.getAllTransactions();
    responseHandler.success(res, "Transactions retrieved successfully", transactions);
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id);
    if (!transaction) return responseHandler.error(res, "Transaction not found", 404);
    responseHandler.success(res, "Transaction retrieved successfully", transaction);
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.updateTransaction(req.params.id, req.body);
    if (!transaction) return responseHandler.error(res, "Transaction not found", 404);
    responseHandler.success(res, "Transaction updated successfully", transaction);
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.deleteTransaction(req.params.id);
    if (!transaction) return responseHandler.error(res, "Transaction not found", 404);
    responseHandler.success(res, "Transaction deleted successfully", transaction);
  } catch (error) {
    next(error);
  }
};

// Filter Transactions by Tags
const filterTransactionsByTags = async (req, res, next) => {
  try {
    const { tags } = req.query; // Expecting comma-separated tags in query
    const tagsArray = tags.split(",");
    const transactions = await transactionService.filterTransactionsByTags(tagsArray);
    responseHandler.success(res, "Transactions filtered successfully", transactions);
  } catch (error) {
    next(error);
  }
};

// Sort Transactions by Date
const sortTransactionsByDate = async (req, res, next) => {
  try {
    const { order } = req.query; // "asc" or "desc"
    const transactions = await transactionService.sortTransactionsByDate(order);
    responseHandler.success(res, "Transactions sorted successfully", transactions);
  } catch (error) {
    next(error);
  }
};

const updateTransactionTags = async (req, res, next) => {
  try {
    const { tags } = req.body; // Expecting an array of tags
    if (!tags || !Array.isArray(tags)) {
      return responseHandler.error(res, "Tags must be an array", 400);
    }

    const transaction = await transactionService.updateTransactionTags(req.params.id, tags);
    if (!transaction) return responseHandler.error(res, "Transaction not found", 404);

    responseHandler.success(res, "Transaction tags updated successfully", transaction);
  } catch (error) {
    next(error);
  }
};

// const processRecurringTransactions = async (req, res, next) => {
//   try {
//     await transactionService.processRecurringTransactions();
//     responseHandler.success(res, "Recurring transactions processed successfully");
//   } catch (error) {
//     next(error);
//   }
// };

const generateFinancialReport = async (req, res, next) => {
  try {
    const report = await transactionService.generateFinancialReport(req.query);
    responseHandler.success(res, "Financial report generated successfully", report);
  } catch (error) {
    next(error);
  }
};

const generateChartData = async (req, res, next) => {
  try {
    const report = await transactionService.generateFinancialReport(req.query);

    const chartData = {
      labels: ["Income", "Expenses"],
      datasets: [
        {
          label: "Amount",
          data: [report.totalIncome, report.totalExpenses],
        },
      ],
    };

    responseHandler.success(res, "Chart data generated successfully", chartData);
  } catch (error) {
    next(error);
  }
};

const calculateMonthlyBudget = async (req, res, next) => {
  try {
    const { budget, month, year } = req.query; // User input from query params

    if (!budget || !month || !year) {
      return responseHandler.error(res, "Budget, month, and year are required", 400);
    }

    const report = await transactionService.calculateMonthlyBudget(parseFloat(budget), parseInt(month), parseInt(year));
    responseHandler.success(res, "Budget analysis completed", report);
  } catch (error) {
    next(error);
  }
};

const trackSavingsProgress = async (req, res, next) => {
  try {
    const progress = await transactionService.trackSavingsProgress(req.user.id);
    responseHandler.success(res, "Savings progress retrieved successfully", progress);
  } catch (error) {
    next(error);
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
  generateChartData,
  calculateMonthlyBudget, // Added function
  trackSavingsProgress,
};
