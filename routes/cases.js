const express = require("express")
const { validateCaseCreation, validateCaseUpdate } = require("../middleware/validation")
const { authenticateToken, requirePoliceOrAdmin, requireAdmin } = require("../middleware/auth")
const {
  getCases,
  getCase,
  createCase,
  updateCase,
  deleteCase,
  addNote,
  getCaseStats,
} = require("../controllers/caseController")

const router = express.Router()

// Apply authentication to all routes
router.use(authenticateToken)

// @route   GET /api/cases/stats
router.get("/stats", requirePoliceOrAdmin, getCaseStats)

// @route   GET /api/cases
router.get("/", requirePoliceOrAdmin, getCases)

// @route   POST /api/cases
router.post("/", requirePoliceOrAdmin, validateCaseCreation, createCase)

// @route   GET /api/cases/:id
router.get("/:id", requirePoliceOrAdmin, getCase)

// @route   PUT /api/cases/:id
router.put("/:id", requirePoliceOrAdmin, validateCaseUpdate, updateCase)

// @route   DELETE /api/cases/:id
router.delete("/:id", requireAdmin, deleteCase)

// @route   POST /api/cases/:id/notes
router.post("/:id/notes", requirePoliceOrAdmin, addNote)

module.exports = router
