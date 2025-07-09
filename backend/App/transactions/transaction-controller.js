import Transaction from "./transaction-models.js";
import User from "../users/user-models.js";

// Create a new transaction
export const createTransaction = async (req, res) => {
  try {
    const { toId, amount, type, isInternational = false, description = "" } = req.body;
    const fromId = req.user.userId; // from authenticated user

    // Validate input
    if (!toId || !amount || !type) {
      return res.status(400).json({
        success: false,
        message: "toId, amount, and type are required.",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0.",
      });
    }

    // Check if recipient exists
    const recipient = await User.findOne({ userID: toId });
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found.",
      });
    }

    // Check if sender has sufficient balance for transfers
    if (type === "transfer" || type === "payment") {
      const sender = await User.findOne({ userID: fromId });
      const commission = isInternational ? 0.1 * amount : 0.02 * amount;
      const totalAmount = amount + commission;

      if (sender.balance < totalAmount) {
        return res.status(400).json({
          success: false,
          message: "Insufficient balance.",
        });
      }
    }

    // Create transaction
    const newTransaction = new Transaction({
      fromId,
      toId,
      amount,
      type,
      isInternational,
      description,
    });

    await newTransaction.save();

    res.status(201).json({
      success: true,
      message: "Transaction created successfully.",
      transaction: newTransaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all transactions for a user
export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status, type } = req.query;

    const filter = {
      $or: [{ fromId: userId }, { toId: userId }],
    };

    if (status) filter.status = status;
    if (type) filter.type = type;

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("fromId", "name userID")
      .populate("toId", "name userID");

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all transactions (admin only)
export const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("fromId", "name userID")
      .populate("toId", "name userID")
      .populate("processedBy", "name userID");

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Approve or reject transaction (admin only)
export const processTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    const processedBy = req.user.userId;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'approved' or 'rejected'.",
      });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    if (transaction.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Transaction has already been processed.",
      });
    }

    // Update transaction status
    transaction.status = status;
    transaction.processedBy = processedBy;
    transaction.processedAt = new Date();

    if (status === "approved") {
      // Update user balances
      const sender = await User.findOne({ userID: transaction.fromId });
      const recipient = await User.findOne({ userID: transaction.toId });

      if (transaction.type === "transfer" || transaction.type === "payment") {
        const totalAmount = transaction.amount + transaction.commission;
        sender.balance -= totalAmount;
        recipient.balance += transaction.amount;

        await sender.save();
        await recipient.save();
      } else if (transaction.type === "deposit") {
        recipient.balance += transaction.amount;
        await recipient.save();
      } else if (transaction.type === "withdrawal") {
        sender.balance -= transaction.amount;
        await sender.save();
      }
    }

    await transaction.save();

    res.status(200).json({
      success: true,
      message: `Transaction ${status} successfully.`,
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.userId;

    const transaction = await Transaction.findById(transactionId)
      .populate("fromId", "name userID")
      .populate("toId", "name userID")
      .populate("processedBy", "name userID");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    // Check if user has access to this transaction
    if (transaction.fromId.userID !== userId && transaction.toId.userID !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
