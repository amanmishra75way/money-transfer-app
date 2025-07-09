import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);

export default User;
