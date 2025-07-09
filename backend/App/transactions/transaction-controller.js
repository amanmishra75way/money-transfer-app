import Transaction from "./transaction-models.js";
import User from "../users/user-models.js";

export const requestTransaction = async (req, res) => {
  try {
    const { fromUser, toUser, amount, type, isInternational } = req.body;

    const commissionRate = isInternational ? 0.1 : 0.02;
    const commission = type === "transfer" ? amount * commissionRate : 0;

    const txn = await Transaction.create({
      fromUser,
      toUser,
      amount,
      type,
      isInternational,
      commission,
      status: "pending",
    });

    res.status(201).json(txn);
  } catch (err) {
    res.status(500).json({ error: "Failed to request transaction", details: err.message });
  }
};

export const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const txns = await Transaction.find({
      $or: [{ fromUser: userId }, { toUser: userId }],
    }).sort({ timestamp: -1 });

    res.json(txns);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions", details: err.message });
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    const txns = await Transaction.find().sort({ timestamp: -1 });
    res.json(txns);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all transactions", details: err.message });
  }
};

export const approveTransaction = async (req, res) => {
  try {
    const txn = await Transaction.findById(req.params.id);
    if (!txn || txn.status !== "pending") {
      return res.status(400).json({ error: "Invalid or already approved transaction" });
    }

    txn.status = "approved";
    await txn.save();

    // Update balances based on type
    if (txn.type === "deposit") {
      await User.findOneAndUpdate({ userId: txn.toUser }, { $inc: { balance: txn.amount } });
    } else if (txn.type === "withdraw") {
      await User.findOneAndUpdate({ userId: txn.fromUser }, { $inc: { balance: -txn.amount } });
    } else if (txn.type === "transfer") {
      await User.findOneAndUpdate({ userId: txn.fromUser }, { $inc: { balance: -txn.amount } });
      await User.findOneAndUpdate({ userId: txn.toUser }, { $inc: { balance: txn.amount - txn.commission } });

      // Give commission to admin
      const admin = await User.findOne({ isAdmin: true });
      if (admin) {
        await User.findByIdAndUpdate(admin._id, { $inc: { balance: txn.commission } });
      }
    }

    res.json({ message: "Transaction approved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to approve transaction", details: err.message });
  }
};
