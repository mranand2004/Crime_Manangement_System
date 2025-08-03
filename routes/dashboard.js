const express = require("express")
const { authenticateToken, requireAdmin, requirePoliceOrAdmin } = require("../middleware/auth")
const { getDashboardStats, getOfficerPerformance } = require("../controllers/dashboardController")

const router = express.Router()

// Apply authentication to all routes
router.use(authenticateToken)

// @route   GET /api/dashboard/stats
router.get("/stats", requirePoliceOrAdmin, getDashboardStats)

// @route   GET /api/dashboard/officer-performance
router.get("/officer-performance", requireAdmin, getOfficerPerformance)

module.exports = router
