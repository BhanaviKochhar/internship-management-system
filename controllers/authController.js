/**
 * controllers/authController.js
 * ------------------------------
 * Handles registration and login for all user roles.
 *
 * Registration rules:
 *  - Students register themselves (they supply their university email/ID).
 *  - Recruiters are created by company_admin (not via public register).
 *  - Admins are created by super_admin (not via public register).
 *  - Only the `student` role is open for self-registration here.
 */

const jwt        = require("jsonwebtoken");
const User       = require("../models/User");
const University = require("../models/University");

// ── Helper: Generate a signed JWT ─────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// ── Helper: Build a safe user response object (no password) ───────────────────
const sanitiseUser = (user) => ({
  _id:          user._id,
  name:         user.name,
  email:        user.email,
  role:         user.role,
  companyId:    user.companyId,
  universityId: user.universityId,
  isActive:     user.isActive,
  createdAt:    user.createdAt,
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Public registration — students only
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, universityId, rollNumber, department, graduationYear } = req.body;

    // Basic field validation
    if (!name || !email || !password || !universityId) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, password, and universityId.",
      });
    }

    // Confirm the university exists and is active
    const university = await University.findById(universityId);
    if (!university || !university.isActive) {
      return res.status(404).json({
        success: false,
        message: "University not found or is inactive.",
      });
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Create the student user
    const student = await User.create({
      name,
      email,
      password,
      role:         "student",
      universityId,
      studentProfile: {
        rollNumber:     rollNumber     || null,
        department:     department     || null,
        graduationYear: graduationYear || null,
      },
    });

    const token = generateToken(student._id);

    res.status(201).json({
      success: true,
      message: "Student registered successfully.",
      token,
      user: sanitiseUser(student),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login for ALL roles
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    // Explicitly select password (it is excluded by default via `select: false`)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Contact your administrator.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: sanitiseUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get the currently authenticated user's profile
// @access  Private (any authenticated user)
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    // req.user is already attached by the `protect` middleware
    res.status(200).json({
      success: true,
      user: sanitiseUser(req.user),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerStudent, login, getMe };