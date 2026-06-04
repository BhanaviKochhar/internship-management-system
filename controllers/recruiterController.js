/**
 * controllers/recruiterController.js
 * ------------------------------------
 * Actions available to the recruiter role.
 *
 * Responsibilities:
 *  - Create, update, and manage internship postings for their company
 *  - View and update the status of student applications
 */

const InternshipPosting = require("../models/InternshipPosting");

// ─────────────────────────────────────────────────────────────────────────────
//  INTERNSHIP POSTING MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// @route   POST /api/recruiter/postings
// @desc    Create a new internship posting
// @access  recruiter
const createPosting = async (req, res, next) => {
  try {
    const {
      title,
      description,
      requiredSkills,
      durationWeeks,
      isPaid,
      stipendAmount,
      location,
      mode,
      openings,
      applicationDeadline,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    const posting = await InternshipPosting.create({
      title,
      description,
      requiredSkills,
      durationWeeks,
      isPaid,
      stipendAmount,
      location,
      mode,
      openings,
      applicationDeadline,
      postedBy:  req.user._id,       // Linked to the logged-in recruiter
      companyId: req.user.companyId, // Auto-assigned from recruiter's profile
    });

    res.status(201).json({ success: true, message: "Internship posting created.", data: posting });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/recruiter/postings
// @desc    Get all postings created by this recruiter
// @access  recruiter
const getMyPostings = async (req, res, next) => {
  try {
    const postings = await InternshipPosting.find({ postedBy: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, count: postings.length, data: postings });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/recruiter/postings/:id
// @desc    Get a single posting with all its applications
// @access  recruiter
const getPostingWithApplications = async (req, res, next) => {
  try {
    const posting = await InternshipPosting.findOne({
      _id:      req.params.id,
      postedBy: req.user._id, // Ensure recruiter can only see their own postings
    }).populate("applications.studentId", "name email studentProfile");

    if (!posting) {
      return res.status(404).json({
        success: false,
        message: "Posting not found or you do not have access.",
      });
    }

    res.status(200).json({ success: true, data: posting });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/recruiter/postings/:id
// @desc    Update a posting's details (title, description, deadline, etc.)
// @access  recruiter
const updatePosting = async (req, res, next) => {
  try {
    // Prevent recruiter from changing the companyId or postedBy
    const disallowedFields = ["companyId", "postedBy", "applications"];
    disallowedFields.forEach((field) => delete req.body[field]);

    const posting = await InternshipPosting.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!posting) {
      return res.status(404).json({
        success: false,
        message: "Posting not found or you do not have access.",
      });
    }

    res.status(200).json({ success: true, message: "Posting updated.", data: posting });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/recruiter/postings/:id/status
// @desc    Open, close, or set a posting to draft
// @access  recruiter
const updatePostingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["draft", "open", "closed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}.`,
      });
    }

    const posting = await InternshipPosting.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user._id },
      { status },
      { new: true }
    );

    if (!posting) {
      return res.status(404).json({
        success: false,
        message: "Posting not found or you do not have access.",
      });
    }

    res.status(200).json({ success: true, message: `Posting marked as "${status}".`, data: posting });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  APPLICATION MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// @route   PATCH /api/recruiter/postings/:postingId/applications/:applicationId/status
// @desc    Update the status of a student's application (shortlist, reject, offer, etc.)
// @access  recruiter
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, recruiterNote } = req.body;
    const validStatuses = ["applied", "under_review", "shortlisted", "rejected", "offered"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}.`,
      });
    }

    // Find the parent posting (must belong to this recruiter)
    const posting = await InternshipPosting.findOne({
      _id:      req.params.postingId,
      postedBy: req.user._id,
    });

    if (!posting) {
      return res.status(404).json({
        success: false,
        message: "Posting not found or you do not have access.",
      });
    }

    // Locate the specific application inside the posting's applications array
    const application = posting.applications.id(req.params.applicationId);

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    application.status = status;
    if (recruiterNote !== undefined) application.recruiterNote = recruiterNote;

    await posting.save();

    res.status(200).json({
      success: true,
      message: `Application status updated to "${status}".`,
      data:    application,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPosting,
  getMyPostings,
  getPostingWithApplications,
  updatePosting,
  updatePostingStatus,
  updateApplicationStatus,
};