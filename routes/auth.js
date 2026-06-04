/**
 * routes/auth.js
 * --------------
 * Public-facing authentication endpoints.
 * No role restriction — open to all.
 */

const express = require("express");
const router  = express.Router();

const { registerStudent, login, getMe } = require("../controllers/authController");
const { protect }                       = require("../middleware/auth");

// POST /api/auth/register  — Self-registration (students only)
router.post("/register", registerStudent);

// POST /api/auth/login     — Login for all roles
router.post("/login", login);

// GET  /api/auth/me        — Get current user (requires token)
router.get("/me", protect, getMe);

module.exports = router;