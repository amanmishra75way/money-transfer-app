import express from "express";
import { registerUser, loginUser, refreshToken, logoutUser, fetchCurrent } from "./user-controller.js";
import { protect } from "../common/middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/refresh-token", refreshToken);
userRouter.post("/logout", logoutUser);
userRouter.get("/me", protect, fetchCurrent);

export default userRouter;
