import express from "express";
import "dotenv/config";
import connectDB from "./App/common/services/mongoDB.js";
import userRouter from "./App/users/user-route.js";

import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;
connectDB();

// middlewears
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // React app
    credentials: true, // <---- THIS
  })
);

// API Endpoints

app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("Api is working");
});

app.listen(port, () => {
  console.log("listning on PORT :" + port);
});
