/**
 * routes/superAdmin.js
 * ---------------------
 * All routes restricted to super_admin role only.
 * Every route requires a valid JWT AND the super_admin role.
 */

const express = require("express");
const router  = express.Router();

const {
  createCompany,
  getAllCompanies,
  updateCompany,
  createUniversity,
  getAllUniversities,
  updateUniversity,
  createCompanyAdmin,
  createUniversityAdmin,
  getAllUsers,
  toggleUserActive,
} = require("../controllers/superAdminController");

const { protect }    = require("../middleware/auth");
const { authorise }  = require("../middleware/roleCheck");

// Apply protect + authorise middleware to ALL routes in this file
router.use(protect, authorise("super_admin"));

// ── Company routes ─────────────────────────────────────────────────────────────
router.post("/companies",         createCompany);
router.get("/companies",          getAllCompanies);
router.put("/companies/:id",      updateCompany);

// ── University routes ──────────────────────────────────────────────────────────
router.post("/universities",      createUniversity);
router.get("/universities",       getAllUniversities);
router.put("/universities/:id",   updateUniversity);

// ── Admin creation routes ──────────────────────────────────────────────────────
router.post("/create-company-admin",    createCompanyAdmin);
router.post("/create-university-admin", createUniversityAdmin);

// ── User management routes ─────────────────────────────────────────────────────
router.get("/users",                          getAllUsers);
router.patch("/users/:id/toggle-active",      toggleUserActive);

module.exports = router;