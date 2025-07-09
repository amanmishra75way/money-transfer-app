// import jwt from "jsonwebtoken";
// import User from "../../users/user-models.js";

// const authMiddleware = async (req, res, next) => {
//   let token;

//   // 1. Check Authorization header
//   if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   // 2. Fallback to accessToken cookie
//   if (!token && req.cookies?.accessToken) {
//     token = req.cookies.accessToken;
//   }

//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: "Not authorized, token missing",
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.ACCESS_SECRET);

//     const user = await User.findById(decoded.sub).select("-passwordHash -refreshToken");
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Attach clean user info
//     req.user = {
//       id: user._id,
//       userId: user.userId,
//       name: user.name,
//       isAdmin: user.isAdmin,
//     };

//     next();
//   } catch (err) {
//     res.status(401).json({
//       success: false,
//       message: "Token invalid or expired",
//     });
//   }
// };

// export default authMiddleware;
