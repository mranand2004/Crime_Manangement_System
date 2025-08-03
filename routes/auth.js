const express = require("express")
const { validateLogin } = require("../middleware/validation")
const { authenticateToken } = require("../middleware/auth")
const { login, getProfile, updateProfile, changePassword, logout } = require("../controllers/authController")

const router = express.Router()

// @route   POST /api/auth/login
router.post("/login", validateLogin, login)

// @route   GET /api/auth/profile
router.get("/profile", authenticateToken, getProfile)

// @route   PUT /api/auth/profile
router.put("/profile", authenticateToken, updateProfile)

// @route   PUT /api/auth/change-password
router.put("/change-password", authenticateToken, changePassword)

// @route   POST /api/auth/logout
router.post("/logout", authenticateToken, logout)

module.exports = router
