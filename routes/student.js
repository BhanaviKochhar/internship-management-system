/**
 * routes/student.js
 * ------------------
 * All routes restricted to the student role.
 */

const express = require("express");
const router  = express.Router();

const {
  getProfile,
  updateProfile,
  browsePostings,
  getPostingDetails,
  applyToPosting,
  getMyApplications,
} = require("../controllers/studentController");

const { protect }   = require("../middleware/auth");
const { authorise } = require("../middleware/roleCheck");

router.use(protect, authorise("student"));

// ── Profile ───────────────────────────────────────────────────────────────────
router.get("/profile",  getProfile);
router.put("/profile",  updateProfile);

// ── Browse & apply to postings ────────────────────────────────────────────────
router.get("/postings",             browsePostings);
router.get("/postings/:id",         getPostingDetails);
router.post("/postings/:id/apply",  applyToPosting);

// ── Application tracking ──────────────────────────────────────────────────────
router.get("/my-applications", getMyApplications);

module.exports = router;