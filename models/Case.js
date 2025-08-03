const mongoose = require("mongoose")

const evidenceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["document", "image", "video", "audio", "physical"],
    required: true,
  },
  description: {
    type: String,
    required: true,
    maxlength: [500, "Evidence description cannot exceed 500 characters"],
  },
  fileName: String,
  fileUrl: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
})

const suspectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, "Suspect name cannot exceed 100 characters"],
  },
  age: {
    type: Number,
    min: [1, "Age must be at least 1"],
    max: [150, "Age cannot exceed 150"],
  },
  gender: {
    type: String,
    enum: ["male", "female", "other", "unknown"],
  },
  description: {
    type: String,
    maxlength: [1000, "Suspect description cannot exceed 1000 characters"],
  },
  address: {
    type: String,
    maxlength: [200, "Address cannot exceed 200 characters"],
  },
  phone: {
    type: String,
    match: [/^\+?[\d\s\-$$$$]+$/, "Please enter a valid phone number"],
  },
  status: {
    type: String,
    enum: ["unknown", "identified", "arrested", "charged"],
    default: "unknown",
  },
})

const witnessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, "Witness name cannot exceed 100 characters"],
  },
  phone: {
    type: String,
    required: true,
    match: [/^\+?[\d\s\-$$$$]+$/, "Please enter a valid phone number"],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"],
  },
  address: {
    type: String,
    maxlength: [200, "Address cannot exceed 200 characters"],
  },
  statement: {
    type: String,
    maxlength: [2000, "Witness statement cannot exceed 2000 characters"],
  },
})

const updateLogSchema = new mongoose.Schema({
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  reason: {
    type: String,
    maxlength: [500, "Update reason cannot exceed 500 characters"],
  },
})

const caseSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, "Case title is required"],
      trim: true,
      maxlength: [200, "Case title cannot exceed 200 characters"],
    },
    type: {
      type: String,
      enum: {
        values: [
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
        ],
        message: "Invalid case type",
      },
      required: [true, "Case type is required"],
    },
    subType: {
      type: String,
      trim: true,
      maxlength: [100, "Case sub-type cannot exceed 100 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "active", "investigating", "solved", "closed", "cold"],
        message: "Invalid case status",
      },
      default: "pending",
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "critical"],
        message: "Invalid priority level",
      },
      required: [true, "Priority is required"],
    },
    incidentDate: {
      type: Date,
      required: [true, "Incident date is required"],
      validate: {
        validator: (date) => date <= new Date(),
        message: "Incident date cannot be in the future",
      },
    },
    reportedDate: {
      type: Date,
      default: Date.now,
    },
    location: {
      address: {
        type: String,
        required: [true, "Location address is required"],
        trim: true,
        maxlength: [300, "Address cannot exceed 300 characters"],
      },
      city: {
        type: String,
        trim: true,
        maxlength: [100, "City name cannot exceed 100 characters"],
      },
      state: {
        type: String,
        trim: true,
        maxlength: [100, "State name cannot exceed 100 characters"],
      },
      zipCode: {
        type: String,
        trim: true,
        match: [/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code"],
      },
      coordinates: {
        latitude: {
          type: Number,
          min: [-90, "Latitude must be between -90 and 90"],
          max: [90, "Latitude must be between -90 and 90"],
        },
        longitude: {
          type: Number,
          min: [-180, "Longitude must be between -180 and 180"],
          max: [180, "Longitude must be between -180 and 180"],
        },
      },
    },
    description: {
      type: String,
      required: [true, "Case description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    complainant: {
      name: {
        type: String,
        required: [true, "Complainant name is required"],
        trim: true,
        maxlength: [100, "Complainant name cannot exceed 100 characters"],
      },
      phone: {
        type: String,
        required: [true, "Complainant phone is required"],
        match: [/^\+?[\d\s\-$$$$]+$/, "Please enter a valid phone number"],
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"],
      },
      address: {
        type: String,
        maxlength: [200, "Address cannot exceed 200 characters"],
      },
      relationship: {
        type: String,
        enum: ["victim", "witness", "reporter", "other"],
        default: "reporter",
      },
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned officer is required"],
    },
    assignedOfficerName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, "Department name cannot exceed 100 characters"],
    },
    suspects: [suspectSchema],
    witnesses: [witnessSchema],
    evidence: [evidenceSchema],
    relatedCases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Case",
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    notes: [
      {
        content: {
          type: String,
          required: true,
          maxlength: [1000, "Note cannot exceed 1000 characters"],
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        isPrivate: {
          type: Boolean,
          default: false,
        },
      },
    ],
    updateLog: [updateLogSchema],
    closedDate: Date,
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    closureReason: {
      type: String,
      maxlength: [500, "Closure reason cannot exceed 500 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better performance
caseSchema.index({ caseId: 1 }, { unique: true })
caseSchema.index({ status: 1 })
caseSchema.index({ type: 1 })
caseSchema.index({ priority: 1 })
caseSchema.index({ assignedOfficer: 1 })
caseSchema.index({ createdAt: -1 })
caseSchema.index({ incidentDate: -1 })
caseSchema.index({ "location.city": 1 })
caseSchema.index({ tags: 1 })

// Text index for search functionality
caseSchema.index({
  title: "text",
  description: "text",
  "complainant.name": "text",
  "location.address": "text",
})

// Pre-save middleware to generate case ID
caseSchema.pre("save", async function (next) {
  if (!this.caseId) {
    this.caseId = await generateCaseId()
  }

  // Update the updatedAt field
  this.updatedAt = new Date()

  next()
})

// Method to add update log entry
caseSchema.methods.addUpdateLog = function (updatedBy, changes, reason) {
  this.updateLog.push({
    updatedBy,
    changes,
    reason,
    updatedAt: new Date(),
  })
}

// Method to add note
caseSchema.methods.addNote = function (content, addedBy, isPrivate = false) {
  this.notes.push({
    content,
    addedBy,
    isPrivate,
    addedAt: new Date(),
  })
}

// Static method to get cases by status
caseSchema.statics.getCasesByStatus = function (status) {
  return this.find({ status }).populate("assignedOfficer", "fullName badgeNumber")
}

// Static method to get cases by officer
caseSchema.statics.getCasesByOfficer = function (officerId) {
  return this.find({ assignedOfficer: officerId }).sort({ createdAt: -1 })
}

// Static method to get case statistics
caseSchema.statics.getCaseStats = async function () {
  const stats = await this.aggregate([
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

  return (
    stats[0] || {
      total: 0,
      pending: 0,
      active: 0,
      investigating: 0,
      solved: 0,
      closed: 0,
      cold: 0,
    }
  )
}

// Function to generate unique case ID
async function generateCaseId() {
  const year = new Date().getFullYear()
  const Case = mongoose.model("Case")

  // Find the last case ID for the current year
  const lastCase = await Case.findOne({
    caseId: new RegExp(`^CASE${year}`),
  }).sort({ caseId: -1 })

  let nextNumber = 1
  if (lastCase) {
    const lastNumber = Number.parseInt(lastCase.caseId.substring(8)) // Extract number after CASE2025
    nextNumber = lastNumber + 1
  }

  return `CASE${year}${nextNumber.toString().padStart(4, "0")}`
}

module.exports = mongoose.model("Case", caseSchema)
