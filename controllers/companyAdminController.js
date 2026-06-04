/**
 * controllers/companyAdminController.js
 * ---------------------------------------
 * Actions available to the company_admin role.
 *
 * Responsibilities:
 *  - View and manage their own company's profile
 *  - Create, view, and deactivate recruiter accounts within their company
 *  - View all internship postings made by their company
 */

const User    = require("../models/User");
const Company = require("../models/Company");
const InternshipPosting = require("../models/InternshipPosting");

// ─────────────────────────────────────────────────────────────────────────────
//  COMPANY PROFILE
// ─────────────────────────────────────────────────────────────────────────────

// @route   GET /api/company-admin/my-company
// @desc    Get the company this admin manages
// @access  company_admin
const getMyCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.user.companyId).populate("adminId", "name email");

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found." });
    }

    res.status(200).json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/company-admin/my-company
// @desc    Update the company's own profile (limited fields)
// @access  company_admin
const updateMyCompany = async (req, res, next) => {
  try {
    // Only allow updating descriptive fields — not adminId or isActive
    const allowedUpdates = ["industry", "website", "description"];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const company = await Company.findByIdAndUpdate(req.user.companyId, updates, {
      new:            true,
      runValidators:  true,
    });

    res.status(200).json({ success: true, message: "Company profile updated.", data: company });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  RECRUITER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// @route   POST /api/company-admin/recruiters
// @desc    Add a new recruiter/mentor to this company
// @access  company_admin
const createRecruiter = async (req, res, next) => {
  try {
    const { name, email, password, designation, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password.",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email is already in use." });
    }

    const recruiter = await User.create({
      name,
      email,
      password,
      role:      "recruiter",
      companyId: req.user.companyId, // Automatically scoped to the admin's company
      recruiterProfile: { designation, department },
    });

    res.status(201).json({
      success: true,
      message: "Recruiter created successfully.",
      data: {
        _id:       recruiter._id,
        name:      recruiter.name,
        email:     recruiter.email,
        role:      recruiter.role,
        companyId: recruiter.companyId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/company-admin/recruiters
// @desc    List all recruiters in this company
// @access  company_admin
const getMyRecruiters = async (req, res, next) => {
  try {
    const recruiters = await User.find({
      companyId: req.user.companyId,
      role:      "recruiter",
    }).select("-password");

    res.status(200).json({ success: true, count: recruiters.length, data: recruiters });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/company-admin/recruiters/:id/toggle-active
// @desc    Activate or deactivate a recruiter in this company
// @access  company_admin
const toggleRecruiterActive = async (req, res, next) => {
  try {
    const recruiter = await User.findOne({
      _id:       req.params.id,
      companyId: req.user.companyId,
      role:      "recruiter",
    });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found in your company.",
      });
    }

    recruiter.isActive = !recruiter.isActive;
    await recruiter.save();

    res.status(200).json({
      success: true,
      message: `Recruiter ${recruiter.isActive ? "activated" : "deactivated"}.`,
      data: { _id: recruiter._id, name: recruiter.name, isActive: recruiter.isActive },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  INTERNSHIP POSTINGS OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────

// @route   GET /api/company-admin/postings
// @desc    View all internship postings created by any recruiter in this company
// @access  company_admin
const getCompanyPostings = async (req, res, next) => {
  try {
    const postings = await InternshipPosting.find({ companyId: req.user.companyId })
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: postings.length, data: postings });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCompany,
  updateMyCompany,
  createRecruiter,
  getMyRecruiters,
  toggleRecruiterActive,
  getCompanyPostings,
};