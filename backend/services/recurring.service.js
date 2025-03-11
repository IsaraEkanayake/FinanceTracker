const cron = require("node-cron");
const Transaction = require("../models/transaction.model");

// Simulated Notification Function
const sendNotification = (message, transaction) => {
  console.log(`📢 Notification: ${message} for transaction ID: ${transaction._id}`);
};

// Function to process recurring transactions
const processRecurringTransactions = async () => {
  const now = new Date();

  // Fetch all recurring transactions
  const recurringTransactions = await Transaction.find({ isRecurring: true, endDate: { $gte: now } });

  for (const transaction of recurringTransactions) {
    let nextTransactionDate = new Date(transaction.date);

    // Determine the next transaction date
    switch (transaction.recurrencePattern) {
      case "daily":
        nextTransactionDate.setDate(transaction.date.getDate());
        break;
      case "weekly":
        nextTransactionDate.setDate(transaction.date.getDate() + 7);
        break;
      case "monthly":
        nextTransactionDate.setMonth(transaction.date.getMonth() + 1);
        break;
    }

    // Check if it's time to create the next transaction
    if (nextTransactionDate <= now) {
      // Clone transaction for new occurrence
      const newTransaction = new Transaction({
        ...transaction.toObject(),
        _id: undefined, // New transaction ID
        date: nextTransactionDate
      });

      await newTransaction.save();
      console.log(`✅ Transaction Created: ID ${newTransaction._id} on ${newTransaction.date}`);

      // Send "Upcoming" notification 12 hours before
      setTimeout(() => {
        sendNotification("Upcoming", newTransaction);
      }, 12 * 60 * 60 * 1000);

      // Send "Missing" notification 12 hours after if not paid
      setTimeout(() => {
        sendNotification("Missing", newTransaction);
      }, 36 * 60 * 60 * 1000); // 12 + 24 hours later
    }
  }
};

// Schedule cron job to run every 1 minute (node-cron)
cron.schedule("* * * * *", async () => {
  console.log("⏳ [CRON] Checking for recurring transactions (every 1 minute)...");
  await processRecurringTransactions();
});

// // Run process every 10 seconds using setInterval
// setInterval(async () => {
//   console.log("⏳ [SETINTERVAL] Checking for recurring transactions (every 10 seconds)...");
//   await processRecurringTransactions();
// }, 10 * 1000); // 10 seconds


// cron.schedule("* * * * *", async () => {
//   console.log("Starting recurring transactions process...");
//   await processRecurringTransactions();
// });

module.exports = { processRecurringTransactions };
