/**
 * scripts/seedSuperAdmin.js
 * --------------------------
 * One-time script to inject the super_admin account into MongoDB.
 *
 * Run once from the project root:
 *   node scripts/seedSuperAdmin.js
 *
 * The script is idempotent — it will not create a duplicate if a
 * super_admin already exists with the same email.
 *
 * Change the credentials below before running in any real environment.
 * Never commit real passwords to source control.
 */

const mongoose = require("mongoose");
const dotenv   = require("dotenv");

// Load environment variables from .env
dotenv.config({ path: require("path").resolve(__dirname, "../.env") });

const User = require("../models/User");

const SUPER_ADMIN = {
  name:     "Super Admin",
  email:    "superadmin@ims.com",   // ← Change this
  password: "SuperAdmin@123",       // ← Change this (min 6 chars)
  role:     "super_admin",
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB.");

    // Check for an existing super_admin
    const existing = await User.findOne({ role: "super_admin" });

    if (existing) {
      console.log(`Super admin already exists: ${existing.email}`);
      console.log("    No changes were made.");
    } else {
      // User.create will trigger the pre-save hook and hash the password
      const admin = await User.create(SUPER_ADMIN);
      console.log(`Super admin created successfully!`);
      console.log(`    Email : ${admin.email}`);
      console.log(`    ID    : ${admin._id}`);
    }
  } catch (error) {
    console.error("  Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("  Disconnected from MongoDB.");
    process.exit(0);
  }
};

seed();