import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/tokenUtils.js";
import User from "./user-models.js";

// Register
export const registerUser = async (req, res) => {
  const { userID, name, password, balance = 0, isAdmin = false } = req.body;
  if (!userID || !name || !password) {
    return res.status(400).json({ success: false, message: "userID, name, and password are required." });
  }

  try {
    const existingUser = await User.findOne({ userID });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await new User({ userID, name, password: hashedPassword, balance, isAdmin }).save();

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: { userID: newUser.userID, name: newUser.name, balance: newUser.balance, isAdmin: newUser.isAdmin },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

// Login
export const loginUser = async (req, res) => {
  const { userID, password } = req.body;

  try {
    const user = await User.findOne({ userID });
    if (!user) return res.status(401).json({ success: false, message: "User not found." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ success: false, message: "Invalid credentials." });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful.",
      user: { userID: user.userID, name: user.name, balance: user.balance, isAdmin: user.isAdmin },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

// Refresh Token
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "Refresh token missing." });

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    const accessToken = generateAccessToken(user);
    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired refresh token." });
  }
};

// Logout
export const logoutUser = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ success: false, message: "Refresh token is missing." });

  try {
    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    user.refreshToken = null;
    await user.save();

    res.status(200).json({ success: true, message: "Logout successful." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

// Current User
export const fetchCurrent = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password -refreshToken");

    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};
