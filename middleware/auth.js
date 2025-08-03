const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Authenticate token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from database
    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      })
    }

    if (user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Account is not active",
      })
    }

    // Add user to request object
    req.user = user
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      })
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      })
    } else {
      return res.status(500).json({
        success: false,
        message: "Token verification failed",
      })
    }
  }
}

// Admin authorization middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    })
  }
  next()
}

// Police or Admin authorization middleware
const requirePoliceOrAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "police") {
    return res.status(403).json({
      success: false,
      message: "Police or Admin access required",
    })
  }
  next()
}

// Permission-based authorization middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (
      req.user.role === "admin" ||
      (req.user.permissions && req.user.permissions.includes(permission)) ||
      (req.user.permissions && req.user.permissions.includes("all"))
    ) {
      next()
    } else {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`,
      })
    }
  }
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requirePoliceOrAdmin,
  requirePermission,
}
