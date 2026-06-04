/**
 * models/University.js
 * --------------------
 * Represents a university/institution registered in the system.
 * Created by super_admin. Managed by a university_admin.
 */

const mongoose = require("mongoose");

const UniversitySchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "University name is required."],
      trim:     true,
      unique:   true,
    },

    location: {
      type: String,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // The university_admin user assigned to manage this university
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      default: null,
    },

    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("University", UniversitySchema);