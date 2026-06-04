/**
 * controllers/studentController.js
 * ----------------------------------
 * Actions available to the student role.
 *
 * Responsibilities:
 *  - View and update their own profile
 *  - Browse open internship postings
 *  - Apply to an internship posting
 *  - Track the status of their own applications
 */

const User              = require("../models/User");
const InternshipPosting = require("../models/InternshipPosting");

// ─────────────────────────────────────────────────────────────────────────────
//  PROFILE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// @route   GET /api/student/profile
// @desc    Get the logged-in student's profile
// @access  student
const getProfile = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id)
      .select("-password")
      .populate("universityId", "name location website");

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/student/profile
// @desc    Update the student's own profile
// @access  student
const updateProfile = async (req, res, next) => {
  try {
    // Students can only update their own profile — not role, email, or university
    const allowedUpdates = ["name", "studentProfile"];

    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const student = await User.findByIdAndUpdate(req.user._id, updates, {
      new:           true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({ success: true, message: "Profile updated.", data: student });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  PLACEMENT FEATURE — Browse & Apply to Internships
// ─────────────────────────────────────────────────────────────────────────────

// @route   GET /api/student/postings
// @desc    Browse all currently open internship postings
// @access  student
const browsePostings = async (req, res, next) => {
  try {
    // Support optional skill filter: GET /api/student/postings?skill=Python
    const filter = { status: "open" };
    if (req.query.skill) {
      filter.requiredSkills = { $in: [new RegExp(req.query.skill, "i")] };
    }

    const postings = await InternshipPosting.find(filter)
      .populate("companyId", "name industry website")
      .select("-applications") // Don't expose other students' applications
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: postings.length, data: postings });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/student/postings/:id
// @desc    Get details of a single internship posting
// @access  student
const getPostingDetails = async (req, res, next) => {
  try {
    const posting = await InternshipPosting.findOne({
      _id:    req.params.id,
      status: "open",
    })
      .populate("companyId", "name industry website description")
      .select("-applications");

    if (!posting) {
      return res.status(404).json({ success: false, message: "Posting not found or is no longer open." });
    }

    res.status(200).json({ success: true, data: posting });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/student/postings/:id/apply
// @desc    Apply to an internship posting
// @access  student
const applyToPosting = async (req, res, next) => {
  try {
    const { coverLetter } = req.body;

    const posting = await InternshipPosting.findOne({
      _id:    req.params.id,
      status: "open",
    });

    if (!posting) {
      return res.status(404).json({
        success: false,
        message: "This internship posting is no longer accepting applications.",
      });
    }

    // Check if the student has already applied
    const alreadyApplied = posting.applications.some(
      (app) => app.studentId.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this internship.",
      });
    }

    // Check if deadline has passed
    if (posting.applicationDeadline && new Date() > new Date(posting.applicationDeadline)) {
      return res.status(400).json({
        success: false,
        message: "The application deadline for this posting has passed.",
      });
    }

    // Push the new application to the posting's applications array
    posting.applications.push({
      studentId:   req.user._id,
      coverLetter: coverLetter || "",
    });

    await posting.save();

    res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/student/my-applications
// @desc    Get all of the student's submitted applications with current status
// @access  student
const getMyApplications = async (req, res, next) => {
  try {
    // Find all postings that contain an application from this student
    const postings = await InternshipPosting.find({
      "applications.studentId": req.user._id,
    }).populate("companyId", "name industry");

    // Extract only this student's application from each posting
    const applications = postings.map((posting) => {
      const myApp = posting.applications.find(
        (app) => app.studentId.toString() === req.user._id.toString()
      );

      return {
        posting: {
          _id:      posting._id,
          title:    posting.title,
          company:  posting.companyId,
          location: posting.location,
          mode:     posting.mode,
        },
        application: {
          _id:         myApp._id,
          status:      myApp.status,
          appliedAt:   myApp.appliedAt,
          coverLetter: myApp.coverLetter,
        },
      };
    });

    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  browsePostings,
  getPostingDetails,
  applyToPosting,
  getMyApplications,
};