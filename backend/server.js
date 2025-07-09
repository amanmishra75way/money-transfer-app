import express from "express";
import "dotenv/config";
import connectDB from "./App/common/services/mongoDB.js";
import userRouter from "./App/users/user-route.js";
import transactionRouter from "./App/transactions/transaction-route.js";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { rateLimit } from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many requests, please try again later.",
  },
});
app.use(limiter);

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend origin
    credentials: true,
  })
);

const swaggerPath = path.join(__dirname, "docs", "swagger.json");
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api/user", userRouter);
app.use("/api/transactions", transactionRouter);

app.get("/", (req, res) => {
  res.send("API is working");
});

app.listen(port, () => {
  console.log(`Listening on PORT: ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
