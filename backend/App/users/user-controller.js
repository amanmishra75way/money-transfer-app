import User from "./user-models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  const { userID, name, password, balance = 0, isAdmin = false } = req.body;

  // Check for required fields
  if (!userID || !name || !password) {
    return res.status(400).json({
      success: false,
      message: "userID, name, and password are required.",
    });
  }

  // Check for duplicate userID
  try {
    const existingUser = await User.findOne({ userID });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this userID already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      userID,
      name,
      password: hashedPassword,
      balance,
      isAdmin,
    });

    const newUser = await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: {
        userID: newUser.userID,
        name: newUser.name,
        balance: newUser.balance,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err,
    });
  }
};

export const loginUser = async (req, res) => {
  const { userID, password } = req.body;

  try {
    // Find the user
    const user = await User.findOne({ userID });

    // If user not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If passwords don't match
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Generate tokens
    const accessToken = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    // Update user with refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Send tokens and user info in response
    res.status(200).json({
      success: true,
      message: "Login successful.",
      accessToken,
      refreshToken,
      user: { userID: user.userID, name: user.name, balance: user.balance, isAdmin: user.isAdmin },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  // Token refresh logic goes here
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "Refresh token is missing." });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid or expired refresh token." });
    }

    try {
      const user = await User.findById(decoded.userId);

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(403).json({ success: false, message: "Invalid refresh token." });
      }

      const newAccessToken = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });

      res
        .status(200)
        .json({ success: true, message: "Access token refreshed successfully.", accessToken: newAccessToken });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  });
};

export const logoutUser = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, message: "Refresh token is missing." });
  }

  try {
    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found with this refresh token." });
    }

    user.refreshToken = null;
    await user.save();

    res.status(200).json({ success: true, message: "Logout successful." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const fetchCurrent = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
