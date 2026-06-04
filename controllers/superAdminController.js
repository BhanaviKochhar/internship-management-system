/**
 * controllers/superAdminController.js
 * -------------------------------------
 * All actions available exclusively to the super_admin role.
 *
 * Responsibilities:
 *  - Create and manage Company records
 *  - Create and manage University records
 *  - Create company_admin and university_admin user accounts
 *  - View and deactivate/reactivate any user in the system
 */

const User       = require("../models/User");
const Company    = require("../models/Company");
const University = require("../models/University");

// ─────────────────────────────────────────────────────────────────────────────
//  COMPANY MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// @route   POST /api/super-admin/companies
// @desc    Register a new company in the system
// @access  super_admin
const createCompany = async (req, res, next) => {
  try {
    const { name, industry, website, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Company name is required." });
    }

    const company = await Company.create({ name, industry, website, description });

    res.status(201).json({ success: true, message: "Company created.", data: company });
  } catch (error) {
    // Mongoose duplicate key error code
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "A company with this name already exists." });
    }
    next(error);
  }
};

// @route   GET /api/super-admin/companies
// @desc    List all companies
// @access  super_admin
const getAllCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().populate("adminId", "name email");
    res.status(200).json({ success: true, count: companies.length, data: companies });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/super-admin/companies/:id
// @desc    Update a company's details
// @access  super_admin
const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found." });
    }

    res.status(200).json({ success: true, message: "Company updated.", data: company });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  UNIVERSITY MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// @route   POST /api/super-admin/universities
// @desc    Register a new university in the system
// @access  super_admin
const createUniversity = async (req, res, next) => {
  try {
    const { name, location, website, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "University name is required." });
    }

    const university = await University.create({ name, location, website, description });

    res.status(201).json({ success: true, message: "University created.", data: university });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "A university with this name already exists." });
    }
    next(error);
  }
};

// @route   GET /api/super-admin/universities
// @desc    List all universities
// @access  super_admin
const getAllUniversities = async (req, res, next) => {
  try {
    const universities = await University.find().populate("adminId", "name email");
    res.status(200).json({ success: true, count: universities.length, data: universities });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/super-admin/universities/:id
// @desc    Update a university's details
// @access  super_admin
const updateUniversity = async (req, res, next) => {
  try {
    const university = await University.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!university) {
      return res.status(404).json({ success: false, message: "University not found." });
    }

    res.status(200).json({ success: true, message: "University updated.", data: university });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN USER CREATION
// ─────────────────────────────────────────────────────────────────────────────

// @route   POST /api/super-admin/create-company-admin
// @desc    Create a company_admin user and link them to a company
// @access  super_admin
const createCompanyAdmin = async (req, res, next) => {
  try {
    const { name, email, password, companyId } = req.body;

    if (!name || !email || !password || !companyId) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, password, and companyId.",
      });
    }

    // Verify the target company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found." });
    }

    // Check for duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email is already in use." });
    }

    // Create the admin user
    const admin = await User.create({
      name,
      email,
      password,
      role:      "company_admin",
      companyId,
    });

    // Link this admin back to the company document
    await Company.findByIdAndUpdate(companyId, { adminId: admin._id });

    res.status(201).json({
      success: true,
      message: "Company admin created successfully.",
      data: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role, companyId },
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/super-admin/create-university-admin
// @desc    Create a university_admin user and link them to a university
// @access  super_admin
const createUniversityAdmin = async (req, res, next) => {
  try {
    const { name, email, password, universityId } = req.body;

    if (!name || !email || !password || !universityId) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, password, and universityId.",
      });
    }

    // Verify the target university exists
    const university = await University.findById(universityId);
    if (!university) {
      return res.status(404).json({ success: false, message: "University not found." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email is already in use." });
    }

    const admin = await User.create({
      name,
      email,
      password,
      role:         "university_admin",
      universityId,
    });

    // Link this admin back to the university document
    await University.findByIdAndUpdate(universityId, { adminId: admin._id });

    res.status(201).json({
      success: true,
      message: "University admin created successfully.",
      data: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role, universityId },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GLOBAL USER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// @route   GET /api/super-admin/users
// @desc    Get all users in the system (with optional ?role= filter)
// @access  super_admin
const getAllUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select("-password");
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/super-admin/users/:id/toggle-active
// @desc    Activate or deactivate any user account
// @access  super_admin
const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Prevent deactivating the super_admin itself
    if (user.role === "super_admin") {
      return res.status(400).json({
        success: false,
        message: "The super_admin account cannot be deactivated.",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account ${user.isActive ? "activated" : "deactivated"}.`,
      data: { _id: user._id, name: user.name, isActive: user.isActive },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCompany,
  getAllCompanies,
  updateCompany,
  createUniversity,
  getAllUniversities,
  updateUniversity,
  createCompanyAdmin,
  createUniversityAdmin,
  getAllUsers,
  toggleUserActive,
};