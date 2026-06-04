/**
 * models/Company.js
 * -----------------
 * Represents a company registered in the system.
 * Created by super_admin. Managed by a company_admin.
 */

const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Company name is required."],
      trim:     true,
      unique:   true,
    },

    industry: {
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

    // The company_admin user assigned to manage this company
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

module.exports = mongoose.model("Company", CompanySchema);