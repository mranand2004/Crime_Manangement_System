const Case = require("../models/Case")
const User = require("../models/User")

// @desc    Get all cases
// @route   GET /api/cases
// @access  Private
const getCases = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      priority,
      assignedOfficer,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query

    // Build query
    const query = {}

    if (status) query.status = status
    if (type) query.type = type
    if (priority) query.priority = priority
    if (assignedOfficer) query.assignedOfficer = assignedOfficer

    // Text search
    if (search) {
      query.$text = { $search: search }
    }

    // If user is police officer, only show their assigned cases
    if (req.user.role === "police") {
      query.assignedOfficer = req.user._id
    }

    // Calculate pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    // Execute query
    const cases = await Case.find(query)
      .populate("assignedOfficer", "fullName badgeNumber department")
      .populate("createdBy", "fullName")
      .sort(sort)
      .skip(skip)
      .limit(Number.parseInt(limit))

    // Get total count for pagination
    const total = await Case.countDocuments(query)

    res.json({
      success: true,
      data: cases,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("Get cases error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get single case
// @route   GET /api/cases/:id
// @access  Private
const getCase = async (req, res) => {
  try {
    const case_ = await Case.findById(req.params.id)
      .populate("assignedOfficer", "fullName badgeNumber department email phone")
      .populate("createdBy", "fullName")
      .populate("updateLog.updatedBy", "fullName")
      .populate("notes.addedBy", "fullName")
      .populate("evidence.uploadedBy", "fullName")

    if (!case_) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      })
    }

    // Check if police officer can access this case
    if (req.user.role === "police" && case_.assignedOfficer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied - not assigned to this case",
      })
    }

    res.json({
      success: true,
      data: case_,
    })
  } catch (error) {
    console.error("Get case error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Create new case
// @route   POST /api/cases
// @access  Private
const createCase = async (req, res) => {
  try {
    // Get assigned officer details
    const assignedOfficer = await User.findById(req.body.assignedOfficer)
    if (!assignedOfficer || assignedOfficer.role !== "police") {
      return res.status(400).json({
        success: false,
        message: "Invalid assigned officer",
      })
    }

    // Parse location if it's a string
    let location = req.body.location
    if (typeof location === "string") {
      location = { address: location }
    }

    // Parse complainant if it's a string
    let complainant = req.body.complainant
    if (typeof complainant === "string") {
      complainant = {
        name: complainant,
        phone: req.body.complainantContact || req.body.complainantPhone,
      }
    }

    const caseData = {
      ...req.body,
      location,
      complainant,
      assignedOfficerName: assignedOfficer.fullName,
      department: assignedOfficer.department,
      createdBy: req.user._id,
    }

    const case_ = await Case.create(caseData)

    // Populate the created case
    const populatedCase = await Case.findById(case_._id)
      .populate("assignedOfficer", "fullName badgeNumber department")
      .populate("createdBy", "fullName")

    res.status(201).json({
      success: true,
      message: "Case created successfully",
      data: populatedCase,
    })
  } catch (error) {
    console.error("Create case error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Update case
// @route   PUT /api/cases/:id
// @access  Private
const updateCase = async (req, res) => {
  try {
    const case_ = await Case.findById(req.params.id)

    if (!case_) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      })
    }

    // Check permissions
    if (req.user.role === "police" && case_.assignedOfficer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied - not assigned to this case",
      })
    }

    // Store original data for update log
    const originalData = case_.toObject()

    // Update case
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        case_[key] = req.body[key]
      }
    })

    // Add update log entry
    const changes = {}
    Object.keys(req.body).forEach((key) => {
      if (originalData[key] !== req.body[key]) {
        changes[key] = {
          from: originalData[key],
          to: req.body[key],
        }
      }
    })

    if (Object.keys(changes).length > 0) {
      case_.addUpdateLog(req.user._id, changes, req.body.updateReason)
    }

    await case_.save()

    // Populate and return updated case
    const updatedCase = await Case.findById(case_._id)
      .populate("assignedOfficer", "fullName badgeNumber department")
      .populate("createdBy", "fullName")

    res.json({
      success: true,
      message: "Case updated successfully",
      data: updatedCase,
    })
  } catch (error) {
    console.error("Update case error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Delete case
// @route   DELETE /api/cases/:id
// @access  Private (Admin only)
const deleteCase = async (req, res) => {
  try {
    const case_ = await Case.findById(req.params.id)

    if (!case_) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      })
    }

    await Case.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Case deleted successfully",
    })
  } catch (error) {
    console.error("Delete case error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Add note to case
// @route   POST /api/cases/:id/notes
// @access  Private
const addNote = async (req, res) => {
  try {
    const { content, isPrivate = false } = req.body

    const case_ = await Case.findById(req.params.id)

    if (!case_) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      })
    }

    // Check permissions
    if (req.user.role === "police" && case_.assignedOfficer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied - not assigned to this case",
      })
    }

    case_.addNote(content, req.user._id, isPrivate)
    await case_.save()

    // Return updated case with populated notes
    const updatedCase = await Case.findById(case_._id).populate("notes.addedBy", "fullName")

    res.json({
      success: true,
      message: "Note added successfully",
      data: updatedCase.notes,
    })
  } catch (error) {
    console.error("Add note error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get case statistics
// @route   GET /api/cases/stats
// @access  Private
const getCaseStats = async (req, res) => {
  try {
    const matchQuery = {}

    // If user is police officer, only show their assigned cases
    if (req.user.role === "police") {
      matchQuery.assignedOfficer = req.user._id
    }

    const stats = await Case.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          investigating: { $sum: { $cond: [{ $eq: ["$status", "investigating"] }, 1, 0] } },
          solved: { $sum: { $cond: [{ $eq: ["$status", "solved"] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
          cold: { $sum: { $cond: [{ $eq: ["$status", "cold"] }, 1, 0] } },
        },
      },
    ])

    const result = stats[0] || {
      total: 0,
      pending: 0,
      active: 0,
      investigating: 0,
      solved: 0,
      closed: 0,
      cold: 0,
    }

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Get case stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  getCases,
  getCase,
  createCase,
  updateCase,
  deleteCase,
  addNote,
  getCaseStats,
}
