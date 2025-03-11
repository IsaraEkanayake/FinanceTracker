const express = require("express");
const router = express.Router();
const transactionController = require("../controlers/transaction.controller");
const { verifyToken, verifyAdmin } = require("../middlewares/auth.middleware");

// 🔒 Protect all routes (Authenticated users only)
router.post("/create", verifyToken, transactionController.createTransaction);
router.get("/getall", verifyToken, transactionController.getAllTransactions);
router.get("/getone/:id", verifyToken, transactionController.getTransactionById);
router.put("/update/:id", verifyToken, transactionController.updateTransaction);
router.delete("/delete/:id", verifyToken, transactionController.deleteTransaction);

// Filtering and Sorting Transactions
router.get("/filter", verifyToken, transactionController.filterTransactionsByTags); // ?tags=vacation,work
router.get("/sort", verifyToken, transactionController.sortTransactionsByDate); // ?order=asc or ?order=desc
router.patch("/update-tags/:id", verifyToken, transactionController.updateTransactionTags);
// API to manually process recurring transactions (for testing)

// router.get("/process-recurring", verifyToken, transactionController.processRecurringTransactions);

// API to generate financial reports
router.get("/report", verifyToken, transactionController.generateFinancialReport);
// API to generate chart data
router.get("/chart-data", verifyToken, transactionController.generateChartData);

// API to calculate monthly budget
router.get("/budget-analysis", verifyToken, transactionController.calculateMonthlyBudget);

// API to track savings progress
router.get("/savings-progress", verifyToken, transactionController.trackSavingsProgress);



// 🔒 Admin-only route (Example)
router.delete("/admin/delete/:id", verifyToken, verifyAdmin, transactionController.deleteTransaction);

module.exports = router;
