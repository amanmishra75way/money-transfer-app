import express from "express";
import { request } from "express";
import { registerUser } from "./user-controller.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);

export default userRouter;
