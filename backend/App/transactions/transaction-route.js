import express from "express";
import {
  requestTransaction,
  getMyTransactions,
  getAllTransactions,
  approveTransaction,
} from "./transaction-controller.js";

import authMiddleware from "../common/middleware/authMiddleware.js";
import adminMiddleware from "../common/middleware/adminMiddleware.js";

const transactionRouter = express.Router();

// Request a new transaction (transfer, deposit, withdraw)
transactionRouter.post("/", authMiddleware, requestTransaction);

// Get current user's transactions
transactionRouter.get("/", authMiddleware, getMyTransactions);

// Get all transactions (admin only)
transactionRouter.get("/all", authMiddleware, adminMiddleware, getAllTransactions);

// Approve a transaction (admin only)
transactionRouter.patch("/:id/approve", authMiddleware, adminMiddleware, approveTransaction);

export default transactionRouter;
