const Case = require("../models/Case")
const User = require("../models/User")

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const caseMatchQuery = {}
    const userMatchQuery = {}

    // If user is police officer, only show their assigned cases
    if (req.user.role === "police") {
      caseMatchQuery.assignedOfficer = req.user._id
    }

    // Get case statistics
    const caseStats = await Case.aggregate([
      { $match: caseMatchQuery },
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

    // Get case type distribution
    const caseTypeStats = await Case.aggregate([
      { $match: caseMatchQuery },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ])

    // Get priority distribution
    const priorityStats = await Case.aggregate([
      { $match: caseMatchQuery },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ])

    // Get recent cases
    const recentCases = await Case.find(caseMatchQuery)
      .populate("assignedOfficer", "fullName badgeNumber")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("caseId title status priority createdAt type")

    // Get user statistics (admin only)
    let userStats = null
    if (req.user.role === "admin") {
      const userStatsResult = await User.aggregate([
        { $match: userMatchQuery },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
            adminUsers: { $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] } },
            policeUsers: { $sum: { $cond: [{ $eq: ["$role", "police"] }, 1, 0] } },
          },
        },
      ])
      userStats = userStatsResult[0] || { totalUsers: 0, activeUsers: 0, adminUsers: 0, policeUsers: 0 }
    }

    // Get monthly case trends (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyTrends = await Case.aggregate([
      {
        $match: {
          ...caseMatchQuery,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ])

    const result = {
      cases: caseStats[0] || { total: 0, pending: 0, active: 0, investigating: 0, solved: 0, closed: 0, cold: 0 },
      caseTypes: caseTypeStats,
      priorities: priorityStats,
      recentCases,
      monthlyTrends,
      ...(userStats && { users: userStats }),
    }

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get officer performance data
// @route   GET /api/dashboard/officer-performance
// @access  Private (Admin only)
const getOfficerPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      }
    }

    const performance = await Case.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$assignedOfficer",
          totalCases: { $sum: 1 },
          solvedCases: { $sum: { $cond: [{ $eq: ["$status", "solved"] }, 1, 0] } },
          activeCases: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          pendingCases: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "officer",
        },
      },
      {
        $unwind: "$officer",
      },
      {
        $project: {
          officerName: "$officer.fullName",
          badgeNumber: "$officer.badgeNumber",
          department: "$officer.department",
          totalCases: 1,
          solvedCases: 1,
          activeCases: 1,
          pendingCases: 1,
          solveRate: {
            $cond: [{ $eq: ["$totalCases", 0] }, 0, { $multiply: [{ $divide: ["$solvedCases", "$totalCases"] }, 100] }],
          },
        },
      },
      { $sort: { totalCases: -1 } },
    ])

    res.json({
      success: true,
      data: performance,
    })
  } catch (error) {
    console.error("Get officer performance error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  getDashboardStats,
  getOfficerPerformance,
}
