const express = require("express")
const { validateUserCreation } = require("../middleware/validation")
const { authenticateToken, requireAdmin, requirePoliceOrAdmin } = require("../middleware/auth")
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getActiveOfficers,
  resetPassword,
} = require("../controllers/userController")

const router = express.Router()

// Apply authentication to all routes
router.use(authenticateToken)

// @route   GET /api/users/officers
router.get("/officers", requirePoliceOrAdmin, getActiveOfficers)

// @route   GET /api/users
router.get("/", requireAdmin, getUsers)

// @route   POST /api/users
router.post("/", requireAdmin, validateUserCreation, createUser)

// @route   GET /api/users/:id
router.get("/:id", requireAdmin, getUser)

// @route   PUT /api/users/:id
router.put("/:id", requireAdmin, updateUser)

// @route   DELETE /api/users/:id
router.delete("/:id", requireAdmin, deleteUser)

// @route   PUT /api/users/:id/reset-password
router.put("/:id/reset-password", requireAdmin, resetPassword)

module.exports = router
