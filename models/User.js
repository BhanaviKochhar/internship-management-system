/**
 * models/User.js
 * --------------
 * Mongoose schema for ALL users in the system.
 *
 * Roles and their responsibilities:
 *  - super_admin      : Injected manually. Manages all admins & the entire system.
 *  - company_admin    : Created by super_admin. Manages recruiters/mentors in a company.
 *  - university_admin : Created by super_admin. Manages students in a university.
 *  - student          : Registered via university portal. Primary internship seeker.
 *  - recruiter        : Added by company_admin. Posts & manages internship openings.
 */

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    // ── Core identity fields ──────────────────────────────────────────────────
    name: {
      type:     String,
      required: [true, "Name is required."],
      trim:     true,
    },

    email: {
      type:      String,
      required:  [true, "Email is required."],
      unique:    true,
      lowercase: true,
      trim:      true,
    },

    password: {
      type:     String,
      required: [true, "Password is required."],
      minlength: 6,
      select:   false, // Never return password in queries by default
    },

    // ── Role-based access control ─────────────────────────────────────────────
    role: {
      type:     String,
      enum:     ["super_admin", "company_admin", "university_admin", "student", "recruiter"],
      required: true,
    },

    // ── Organisation references (populated based on role) ─────────────────────
    // company_admin and recruiter will have a companyId
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Company",
      default: null,
    },

    // university_admin and student will have a universityId
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "University",
      default: null,
    },

    // ── Account status ────────────────────────────────────────────────────────
    isActive: {
      type:    Boolean,
      default: true,
    },

    // ── Student-specific profile fields ───────────────────────────────────────
    // These are only relevant when role === 'student'
    studentProfile: {
      rollNumber:  { type: String, default: null },
      department:  { type: String, default: null },
      graduationYear: { type: Number, default: null },
      cgpa:        { type: Number, default: null },
      skills:      { type: [String], default: [] },
      resumeUrl:   { type: String, default: null }, // Path/URL to uploaded resume
    },

    // ── Recruiter-specific profile fields ─────────────────────────────────────
    recruiterProfile: {
      designation: { type: String, default: null },
      department:  { type: String, default: null },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// ── Pre-save hook: Hash password before saving ────────────────────────────────
UserSchema.pre("save", async function (next) {
  // Only hash if the password field was actually modified
  if (!this.isModified("password")) return next();

  const salt    = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: Compare entered password with stored hash ────────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);