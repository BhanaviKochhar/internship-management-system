/**
 * middleware/auth.js
 * ------------------
 * Verifies the JWT sent in the Authorization header.
 * Attaches the decoded user payload to req.user for downstream use.
 *
 * Expected header format:
 *   Authorization: Bearer <token>
 */

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Check that an Authorization header with a Bearer token was provided
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorised. No token provided.",
    });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the full user document (minus password) to the request
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorised. User no longer exists.",
      });
    }

    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Contact your administrator.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorised. Invalid or expired token.",
    });
  }
};

module.exports = { protect };