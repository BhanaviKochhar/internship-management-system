/**
 * models/InternshipPosting.js
 * ---------------------------
 * Represents an internship opening posted by a recruiter.
 * This is the first placement feature. More will be added in later iterations.
 *
 * Flow:
 *  1. Recruiter creates a posting (associated with their company).
 *  2. University admin can view and share/approve postings for their students.
 *  3. Students can browse open postings and apply.
 *  4. Recruiter can view & manage applications.
 */

const mongoose = require("mongoose");

// ── Embedded sub-schema for a single student application ─────────────────────
const ApplicationSchema = new mongoose.Schema(
  {
    studentId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    // Status managed by the recruiter
    status: {
      type:    String,
      enum:    ["applied", "under_review", "shortlisted", "rejected", "offered"],
      default: "applied",
    },

    coverLetter: {
      type:    String,
      default: "",
    },

    appliedAt: {
      type:    Date,
      default: Date.now,
    },

    // Recruiter can leave internal notes on each application
    recruiterNote: {
      type:    String,
      default: "",
    },
  },
  { _id: true } // Each application gets its own _id
);

// ── Main InternshipPosting schema ─────────────────────────────────────────────
const InternshipPostingSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, "Posting title is required."],
      trim:     true,
    },

    description: {
      type:     String,
      required: [true, "Description is required."],
    },

    // Skills expected from applicants
    requiredSkills: {
      type:    [String],
      default: [],
    },

    // Duration in weeks
    durationWeeks: {
      type: Number,
      min:  1,
    },

    isPaid: {
      type:    Boolean,
      default: false,
    },

    stipendAmount: {
      type:    Number,
      default: 0, // In INR per month
    },

    location: {
      type: String,
      trim: true,
    },

    mode: {
      type:    String,
      enum:    ["remote", "on-site", "hybrid"],
      default: "on-site",
    },

    openings: {
      type:    Number,
      default: 1,
    },

    applicationDeadline: {
      type: Date,
    },

    // References to who posted and from which company
    postedBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    companyId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Company",
      required: true,
    },

    // Posting lifecycle status
    status: {
      type:    String,
      enum:    ["draft", "open", "closed"],
      default: "open",
    },

    // All student applications for this posting
    applications: [ApplicationSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("InternshipPosting", InternshipPostingSchema);