import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    fromId: {
      type: String,
      required: true,
      ref: "User",
    },
    toId: {
      type: String,
      required: true,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      required: true,
      enum: ["transfer", "deposit", "withdrawal", "payment"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    isInternational: {
      type: Boolean,
      default: false,
    },
    commission: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
    processedBy: {
      type: String,
      ref: "User",
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.pre("save", function (next) {
  if (this.isModified("amount") || this.isModified("isInternational")) {
    this.commission = this.isInternational ? 0.1 * this.amount : 0.02 * this.amount;
  }
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
