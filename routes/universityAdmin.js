/**
 * routes/universityAdmin.js
 * --------------------------
 * All routes restricted to the university_admin role.
 */

const express = require("express");
const router  = express.Router();

const {
  getMyUniversity,
  updateMyUniversity,
  getMyStudents,
  getStudentById,
  toggleStudentActive,
  browseOpenPostings,
  getPostingDetails,
} = require("../controllers/universityAdminController");

const { protect }   = require("../middleware/auth");
const { authorise } = require("../middleware/roleCheck");

router.use(protect, authorise("university_admin"));

// ── University profile ────────────────────────────────────────────────────────
router.get("/my-university",  getMyUniversity);
router.put("/my-university",  updateMyUniversity);

// ── Student management ────────────────────────────────────────────────────────
router.get("/students",                       getMyStudents);
router.get("/students/:id",                   getStudentById);
router.patch("/students/:id/toggle-active",   toggleStudentActive);

// ── Placement: Browse internship postings ─────────────────────────────────────
router.get("/postings",      browseOpenPostings);
router.get("/postings/:id",  getPostingDetails);

module.exports = router;