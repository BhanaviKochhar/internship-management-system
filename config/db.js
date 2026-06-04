/**
 * config/db.js
 * ------------
 * Establishes and exports the MongoDB connection using Mongoose.
 * Called once at server startup.
 */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are the recommended defaults for Mongoose 6+
      useNewUrlParser:    true,
      useUnifiedTopology: true,
    });

    console.log(`  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`  MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit immediately — the app cannot run without a DB
  }
};

module.exports = connectDB;