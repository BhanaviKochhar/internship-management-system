/**
 * controllers/universityAdminController.js
 * -----------------------------------------
 * Actions available to the university_admin role.
 *
 * Responsibilities:
 *  - View and manage their own university's profile
 *  - View and manage student accounts within their university
 *  - Browse open internship postings (placement interaction with companies)
 */

const User       = require("../models/User");
const University = require("../models/University");
const InternshipPosting = require("../models/InternshipPosting");

// ─────────────────────────────────────────────────────────────────────────────
//  UNIVERSITY PROFILE
// ─────────────────────────────────────────────────────────────────────────────

// @route   GET /api/university-admin/my-university
// @desc    Get the university this admin manages
// @access  university_admin
const getMyUniversity = async (req, res, next) => {
  try {
    const university = await University.findById(req.user.universityId).populate("adminId", "name email");

    if (!university) {
      return res.status(404).json({ success: false, message: "University not found." });
    }

    res.status(200).json({ success: true, data: university });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/university-admin/my-university
// @desc    Update the university's own profile (limited fields)
// @access  university_admin
const updateMyUniversity = async (req, res, next) => {
  try {
    const allowedUpdates = ["location", "website", "description"];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const university = await University.findByIdAndUpdate(req.user.universityId, updates, {
      new:           true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: "University profile updated.", data: university });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  STUDENT MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// @route   GET /api/university-admin/students
// @desc    Get all students registered under this university
// @access  university_admin
const getMyStudents = async (req, res, next) => {
  try {
    const students = await User.find({
      universityId: req.user.universityId,
      role:         "student",
    }).select("-password");

    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/university-admin/students/:id
// @desc    Get a specific student's full profile
// @access  university_admin
const getStudentById = async (req, res, next) => {
  try {
    const student = await User.findOne({
      _id:          req.params.id,
      universityId: req.user.universityId,
      role:         "student",
    }).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your university.",
      });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/university-admin/students/:id/toggle-active
// @desc    Activate or deactivate a student account
// @access  university_admin
const toggleStudentActive = async (req, res, next) => {
  try {
    const student = await User.findOne({
      _id:          req.params.id,
      universityId: req.user.universityId,
      role:         "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your university.",
      });
    }

    student.isActive = !student.isActive;
    await student.save();

    res.status(200).json({
      success: true,
      message: `Student account ${student.isActive ? "activated" : "deactivated"}.`,
      data: { _id: student._id, name: student.name, isActive: student.isActive },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  PLACEMENT FEATURE — Browse Open Internship Postings
//  This is the shared space where university admin can see what companies offer.
// ─────────────────────────────────────────────────────────────────────────────

// @route   GET /api/university-admin/postings
// @desc    Browse all open internship postings from all companies
// @access  university_admin
const browseOpenPostings = async (req, res, next) => {
  try {
    const postings = await InternshipPosting.find({ status: "open" })
      .populate("companyId", "name industry website")
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: postings.length, data: postings });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/university-admin/postings/:id
// @desc    Get full details of a single internship posting
// @access  university_admin
const getPostingDetails = async (req, res, next) => {
  try {
    const posting = await InternshipPosting.findOne({
      _id:    req.params.id,
      status: "open",
    })
      .populate("companyId", "name industry website")
      .populate("postedBy", "name email recruiterProfile");

    if (!posting) {
      return res.status(404).json({ success: false, message: "Posting not found or is no longer open." });
    }

    res.status(200).json({ success: true, data: posting });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyUniversity,
  updateMyUniversity,
  getMyStudents,
  getStudentById,
  toggleStudentActive,
  browseOpenPostings,
  getPostingDetails,
};