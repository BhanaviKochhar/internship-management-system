/**
 * server.js
 * ---------
 * Entry point for the Internship Management System API.
 * Initialises Express, connects to MongoDB, and mounts all route groups.
 */

const express = require("express");
const dotenv   = require("dotenv");
const cors     = require("cors");
const path     = require("path");

const connectDB = require("./config/db");

// ── Load environment variables ────────────────────────────────────────────────
dotenv.config();

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ── Initialise Express ────────────────────────────────────────────────────────
const app = express();

// ── Global Middleware ─────────────────────────────────────────────────────────
app.use(cors());                        // Allow cross-origin requests (dev)
app.use(express.json());                // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ── Serve static frontend files ───────────────────────────────────────────────
// Once the frontend is built, place it in /public
app.use(express.static(path.join(__dirname, "public")));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",             require("./routes/auth"));
app.use("/api/super-admin",      require("./routes/superAdmin"));
app.use("/api/company-admin",    require("./routes/companyAdmin"));
app.use("/api/university-admin", require("./routes/universityAdmin"));
app.use("/api/student",          require("./routes/student"));
app.use("/api/recruiter",        require("./routes/recruiter"));

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found." });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// Catches any error passed via next(err) from controllers/middleware
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error.",
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`);
});