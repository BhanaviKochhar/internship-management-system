/**
 * routes/companyAdmin.js
 * -----------------------
 * All routes restricted to the company_admin role.
 */

const express = require("express");
const router  = express.Router();

const {
  getMyCompany,
  updateMyCompany,
  createRecruiter,
  getMyRecruiters,
  toggleRecruiterActive,
  getCompanyPostings,
} = require("../controllers/companyAdminController");

const { protect }   = require("../middleware/auth");
const { authorise } = require("../middleware/roleCheck");

router.use(protect, authorise("company_admin"));

// ── Company profile ───────────────────────────────────────────────────────────
router.get("/my-company",  getMyCompany);
router.put("/my-company",  updateMyCompany);

// ── Recruiter management ──────────────────────────────────────────────────────
router.post("/recruiters",                        createRecruiter);
router.get("/recruiters",                         getMyRecruiters);
router.patch("/recruiters/:id/toggle-active",     toggleRecruiterActive);

// ── Internship postings overview ──────────────────────────────────────────────
router.get("/postings", getCompanyPostings);

module.exports = router;