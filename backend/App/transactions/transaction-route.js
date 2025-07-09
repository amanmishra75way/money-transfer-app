import express from "express";
import {
  createTransaction,
  getUserTransactions,
  getAllTransactions,
  processTransaction,
  getTransactionById,
} from "./transaction-controller.js";
// import { authenticateToken } from "../common/middleware/authMiddleware.js";
// import { isAdmin } from "../common/middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", createTransaction);

router.get("/user", getUserTransactions);

router.get("/admin", getAllTransactions);

router.put("/:transactionId/process", processTransaction);

router.get("/:transactionId", getTransactionById);

export default router;
