import User from "./user-models.js";
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
