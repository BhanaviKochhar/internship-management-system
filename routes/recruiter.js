/**
 * routes/recruiter.js
 * --------------------
 * All routes restricted to the recruiter role.
 */

const express = require("express");
const router  = express.Router();

const {
  createPosting,
  getMyPostings,
  getPostingWithApplications,
  updatePosting,
  updatePostingStatus,
  updateApplicationStatus,
} = require("../controllers/recruiterController");

const { protect }   = require("../middleware/auth");
const { authorise } = require("../middleware/roleCheck");

router.use(protect, authorise("recruiter"));

// ── Internship posting CRUD ───────────────────────────────────────────────────
router.post("/postings",           createPosting);
router.get("/postings",            getMyPostings);
router.get("/postings/:id",        getPostingWithApplications);
router.put("/postings/:id",        updatePosting);
router.patch("/postings/:id/status", updatePostingStatus);

// ── Application status management ────────────────────────────────────────────
router.patch(
  "/postings/:postingId/applications/:applicationId/status",
  updateApplicationStatus
);

module.exports = router;