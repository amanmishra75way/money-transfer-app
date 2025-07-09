import express from "express";
import { registerUser, loginUser, refreshToken, logoutUser, fetchCurrent } from "./user-controller.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/refresh-token", refreshToken);
userRouter.post("/logout", logoutUser);
userRouter.get("/me", fetchCurrent);
// userRouter.get("/all", fetchAll);

export default userRouter;
