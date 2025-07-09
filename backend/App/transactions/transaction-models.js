import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  fromUser: { type: String, required: true },
  toUser: { type: String, required: true },
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ["deposit", "withdraw", "transfer"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved"],
    default: "pending",
  },
  isInternational: { type: Boolean, default: false },
  commission: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
