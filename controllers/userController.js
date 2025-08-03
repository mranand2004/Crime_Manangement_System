const User = require("../models/User")

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search, sortBy = "createdAt", sortOrder = "desc" } = req.query

    // Build query
    const query = {}

    if (role) query.role = role
    if (status) query.status = status

    // Text search
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { badgeNumber: { $regex: search, $options: "i" } },
      ]
    }

    // Calculate pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    // Execute query
    const users = await User.find(query)
      .select("-password")
      .populate("createdBy", "fullName")
      .sort(sort)
      .skip(skip)
      .limit(Number.parseInt(limit))

    // Get total count for pagination
    const total = await User.countDocuments(query)

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin only)
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").populate("createdBy", "fullName")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin only)
const createUser = async (req, res) => {
  try {
    const userData = {
      ...req.body,
      createdBy: req.user._id,
    }

    const user = await User.create(userData)

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
    })
  } catch (error) {
    console.error("Create user error:", error)

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      })
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Don't allow updating password through this endpoint
    const { password, ...updateData } = req.body

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password")

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    })
  } catch (error) {
    console.error("Update user error:", error)

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      })
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Don't allow deleting the current user
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      })
    }

    await User.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get active police officers
// @route   GET /api/users/officers
// @access  Private
const getActiveOfficers = async (req, res) => {
  try {
    const officers = await User.find({
      role: "police",
      status: "active",
    }).select("fullName badgeNumber department email")

    res.json({
      success: true,
      data: officers,
    })
  } catch (error) {
    console.error("Get officers error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private (Admin only)
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getActiveOfficers,
  resetPassword,
}
