const { body, validationResult } = require("express-validator")

// Validation middleware to check for errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

// Login validation rules
const validateLogin = [
  body("username").trim().isLength({ min: 3, max: 30 }).withMessage("Username must be between 3 and 30 characters"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("role").isIn(["admin", "police"]).withMessage("Role must be either admin or police"),
  handleValidationErrors,
]

// User creation validation rules
const validateUserCreation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  body("role").isIn(["admin", "police"]).withMessage("Role must be either admin or police"),
  body("fullName").trim().isLength({ min: 2, max: 100 }).withMessage("Full name must be between 2 and 100 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
  body("badgeNumber").optional().trim().isLength({ max: 20 }).withMessage("Badge number cannot exceed 20 characters"),
  body("department")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Department name cannot exceed 100 characters"),
  handleValidationErrors,
]

// Case creation validation rules
const validateCaseCreation = [
  body("title").trim().isLength({ min: 5, max: 200 }).withMessage("Case title must be between 5 and 200 characters"),
  body("type")
    .isIn([
      "theft",
      "assault",
      "fraud",
      "vandalism",
      "drug",
      "domestic",
      "burglary",
      "robbery",
      "murder",
      "kidnapping",
      "cybercrime",
      "other",
    ])
    .withMessage("Invalid case type"),
  body("priority")
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Priority must be low, medium, high, or critical"),
  body("incidentDate")
    .isISO8601()
    .withMessage("Please provide a valid incident date")
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error("Incident date cannot be in the future")
      }
      return true
    }),
  body("location").trim().isLength({ min: 5, max: 300 }).withMessage("Location must be between 5 and 300 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
  body("complainant")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Complainant name must be between 2 and 100 characters"),
  body("complainantContact")
    .matches(/^\+?[\d\s\-$$$$]+$/)
    .withMessage("Please provide a valid phone number"),
  body("assignedOfficer").isMongoId().withMessage("Please provide a valid assigned officer ID"),
  handleValidationErrors,
]

// Case update validation rules
const validateCaseUpdate = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Case title must be between 5 and 200 characters"),
  body("status")
    .optional()
    .isIn(["pending", "active", "investigating", "solved", "closed", "cold"])
    .withMessage("Invalid case status"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Priority must be low, medium, high, or critical"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
  handleValidationErrors,
]

module.exports = {
  validateLogin,
  validateUserCreation,
  validateCaseCreation,
  validateCaseUpdate,
  handleValidationErrors,
}
