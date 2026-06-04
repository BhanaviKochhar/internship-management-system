/**
 * middleware/roleCheck.js
 * -----------------------
 * Role-Based Access Control (RBAC) middleware factory.
 *
 * Usage:
 *   router.get("/admin-only", protect, authorise("super_admin"), handler);
 *   router.get("/shared",     protect, authorise("company_admin", "university_admin"), handler);
 *
 * Must always be used AFTER the `protect` middleware so that req.user is set.
 */

/**
 * Returns a middleware function that allows only users whose role
 * is included in the provided list of allowedRoles.
 *
 * @param  {...string} allowedRoles - One or more role strings to permit.
 * @returns {Function}              - Express middleware
 */
const authorise = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      // This should never happen if `protect` runs first, but guard anyway
      return res.status(401).json({
        success: false,
        message: "Not authorised. Please log in.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of the following roles: ${allowedRoles.join(", ")}.`,
      });
    }

    next();
  };
};

module.exports = { authorise };