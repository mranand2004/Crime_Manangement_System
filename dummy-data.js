// Enhanced Dummy Data Configuration for CRMS with Detailed Case Structure
// This file contains all the initial dummy data for the application

const DUMMY_DATA = {
  // Users data with station assignments
  users: [
    {
      id: 1,
      username: "admin",
      password: "admin123",
      role: "admin",
      fullName: "System Administrator",
      email: "admin@crms.com",
      status: "active",
      createdAt: "2025-01-01T08:00:00Z",
    },
    {
      id: 2,
      username: "officer1",
      password: "police123",
      role: "police",
      fullName: "John Smith",
      email: "john.smith@crms.com",
      badgeNumber: "P001",
      department: "Criminal Investigation",
      station: "PS001",
      status: "active",
      createdAt: "2025-01-02T09:00:00Z",
    },
    {
      id: 3,
      username: "officer2",
      password: "police123",
      role: "police",
      fullName: "Jane Doe",
      email: "jane.doe@crms.com",
      badgeNumber: "P002",
      department: "Patrol Division",
      station: "PS002",
      status: "active",
      createdAt: "2025-01-02T09:30:00Z",
    },
    {
      id: 4,
      username: "officer3",
      password: "police123",
      role: "police",
      fullName: "Mike Johnson",
      email: "mike.johnson@crms.com",
      badgeNumber: "P003",
      department: "Traffic Division",
      station: "PS001",
      status: "active",
      createdAt: "2025-01-03T10:00:00Z",
    },
    {
      id: 5,
      username: "officer4",
      password: "police123",
      role: "police",
      fullName: "Sarah Wilson",
      email: "sarah.wilson@crms.com",
      badgeNumber: "P004",
      department: "Cybercrime Unit",
      station: "PS003",
      status: "active",
      createdAt: "2025-01-03T10:30:00Z",
    },
  ],

  // Police Stations data
  stations: [
    {
      id: "PS001",
      stationCode: "PS001",
      stationName: "Central Police Station",
      address: "123 Main Street, Downtown, City - 100001",
      contact: "+1234567890",
      inCharge: "Inspector Robert Brown",
      createdAt: "2025-01-01T08:00:00Z",
    },
    {
      id: "PS002",
      stationCode: "PS002",
      stationName: "North District Police Station",
      address: "456 North Avenue, North District, City - 100002",
      contact: "+1234567891",
      inCharge: "Inspector Mary Johnson",
      createdAt: "2025-01-01T08:00:00Z",
    },
    {
      id: "PS003",
      stationCode: "PS003",
      stationName: "Cyber Crime Police Station",
      address: "789 Tech Park, IT District, City - 100003",
      contact: "+1234567892",
      inCharge: "Inspector David Lee",
      createdAt: "2025-01-01T08:00:00Z",
    },
  ],

  // Enhanced Cases data with detailed structure
  cases: [
    {
      id: "1",
      caseId: "CR-2025-0001",
      firNumber: "FIR/2025/001",
      dateFiled: "2025-01-15T10:30:00Z",
      filedBy: 2,
      stationId: "PS001",
      caseType: "theft",
      victim: {
        name: "John Store Owner",
        gender: "male",
        age: 45,
        address: "123 Main St, Downtown",
        contact: "+1234567890",
        email: "john@store.com",
      },
      suspect: {
        name: "Unknown Suspect 1",
        gender: "male",
        age: 25,
        address: "Unknown",
        contact: "",
        status: "wanted",
      },
      incidentDetails: {
        description:
          "Multiple laptops and smartphones stolen from electronics store during business hours. Security cameras captured two suspects entering through the back door.",
        location: "Electronics Store, 123 Main St, Downtown",
        incidentDateTime: "2025-01-15T10:30:00Z",
        witnessStatements: ["Store employee saw two men in hoodies", "Customer noticed suspicious activity"],
        evidence: ["security_footage.mp4", "fingerprints.jpg", "witness_statement.pdf"],
      },
      status: "in-progress",
      assignedOfficer: "John Smith",
      lastUpdated: "2025-01-16T14:20:00Z",
      createdAt: "2025-01-15T11:00:00Z",
      createdBy: 2,
    },
    {
      id: "2",
      caseId: "CR-2025-0002",
      firNumber: "FIR/2025/002",
      dateFiled: "2025-01-14T20:00:00Z",
      filedBy: 3,
      stationId: "PS002",
      caseType: "domestic-violence",
      victim: {
        name: "Maria Rodriguez",
        gender: "female",
        age: 32,
        address: "456 Oak Avenue, North District",
        contact: "+1234567891",
        email: "maria.r@email.com",
      },
      suspect: {
        name: "Carlos Rodriguez",
        gender: "male",
        age: 35,
        address: "456 Oak Avenue, North District",
        contact: "+1234567892",
        status: "arrested",
      },
      incidentDetails: {
        description:
          "Domestic violence incident reported by victim. Physical assault resulting in minor injuries. Suspect is victim's husband.",
        location: "456 Oak Avenue, North District",
        incidentDateTime: "2025-01-14T18:45:00Z",
        witnessStatements: ["Neighbor heard screaming and called police"],
        evidence: ["medical_report.pdf", "photos_injuries.jpg", "911_call_recording.mp3"],
      },
      status: "closed",
      assignedOfficer: "Jane Doe",
      lastUpdated: "2025-01-18T16:30:00Z",
      createdAt: "2025-01-14T21:00:00Z",
      createdBy: 3,
    },
    {
      id: "3",
      caseId: "CR-2025-0003",
      firNumber: "FIR/2025/003",
      dateFiled: "2025-01-13T14:20:00Z",
      filedBy: 5,
      stationId: "PS003",
      caseType: "cybercrime",
      victim: {
        name: "Tech Solutions Inc",
        gender: "other",
        age: 0,
        address: "789 Business Park, IT District",
        contact: "+1234567893",
        email: "security@techsolutions.com",
      },
      suspect: {
        name: "Unknown Hacker",
        gender: "unknown",
        age: 0,
        address: "Unknown",
        contact: "",
        status: "unknown",
      },
      incidentDetails: {
        description:
          "Ransomware attack on company servers. All data encrypted and ransom demanded. Investigation ongoing to trace the attackers.",
        location: "Tech Solutions Inc, 789 Business Park",
        incidentDateTime: "2025-01-13T02:30:00Z",
        witnessStatements: ["IT Admin noticed unusual network activity"],
        evidence: ["server_logs.txt", "ransom_note.pdf", "network_analysis.xlsx"],
      },
      status: "open",
      assignedOfficer: "Sarah Wilson",
      lastUpdated: "2025-01-17T10:15:00Z",
      createdAt: "2025-01-13T15:00:00Z",
      createdBy: 5,
    },
    {
      id: "4",
      caseId: "CR-2025-0004",
      firNumber: "FIR/2025/004",
      dateFiled: "2025-01-12T16:45:00Z",
      filedBy: 2,
      stationId: "PS001",
      caseType: "fraud",
      victim: {
        name: "Robert Johnson",
        gender: "male",
        age: 58,
        address: "321 Elm Street, Downtown",
        contact: "+1234567894",
        email: "robert.j@email.com",
      },
      suspect: {
        name: "Alex Thompson",
        gender: "male",
        age: 34,
        address: "Unknown",
        contact: "+1234567895",
        status: "wanted",
      },
      incidentDetails: {
        description:
          "Investment fraud case. Victim lost $50,000 in fake cryptocurrency scheme. Suspect posed as financial advisor.",
        location: "Online/Phone based fraud",
        incidentDateTime: "2025-01-10T14:00:00Z",
        witnessStatements: ["Bank manager confirmed suspicious transactions"],
        evidence: ["bank_statements.pdf", "email_communications.pdf", "fake_website_screenshots.jpg"],
      },
      status: "in-progress",
      assignedOfficer: "John Smith",
      lastUpdated: "2025-01-16T11:30:00Z",
      createdAt: "2025-01-12T17:00:00Z",
      createdBy: 2,
    },
    {
      id: "5",
      caseId: "CR-2025-0005",
      firNumber: "FIR/2025/005",
      dateFiled: "2025-01-11T09:15:00Z",
      filedBy: 4,
      stationId: "PS001",
      caseType: "missing-person",
      victim: {
        name: "Emma Davis",
        gender: "female",
        age: 16,
        address: "654 Pine Street, Downtown",
        contact: "+1234567896",
        email: "emma.davis@email.com",
      },
      suspect: {
        name: "Unknown",
        gender: "unknown",
        age: 0,
        address: "Unknown",
        contact: "",
        status: "unknown",
      },
      incidentDetails: {
        description:
          "16-year-old girl missing since January 10th. Last seen leaving school. No signs of struggle at home.",
        location: "Last seen at Lincoln High School",
        incidentDateTime: "2025-01-10T15:30:00Z",
        witnessStatements: [
          "School friend saw her talking to unknown person",
          "Bus driver confirms she didn't take usual bus",
        ],
        evidence: ["school_cctv.mp4", "missing_person_poster.jpg", "phone_records.pdf"],
      },
      status: "open",
      assignedOfficer: "Mike Johnson",
      lastUpdated: "2025-01-17T08:45:00Z",
      createdAt: "2025-01-11T10:00:00Z",
      createdBy: 4,
    },
  ],

  // Case types with proper labels
  caseTypes: [
    { value: "murder", label: "Murder", color: "#8e44ad" },
    { value: "theft", label: "Theft", color: "#3498db" },
    { value: "robbery", label: "Robbery", color: "#e74c3c" },
    { value: "cybercrime", label: "Cybercrime", color: "#16a085" },
    { value: "domestic-violence", label: "Domestic Violence", color: "#c0392b" },
    { value: "missing-person", label: "Missing Person", color: "#f39c12" },
    { value: "fraud", label: "Fraud", color: "#9b59b6" },
    { value: "other", label: "Other", color: "#7f8c8d" },
  ],

  // Case statuses
  statuses: [
    { value: "open", label: "Open", color: "#f39c12" },
    { value: "in-progress", label: "In Progress", color: "#3498db" },
    { value: "closed", label: "Closed", color: "#27ae60" },
    { value: "pending", label: "Pending Investigation", color: "#e67e22" },
  ],

  // Suspect statuses
  suspectStatuses: [
    { value: "unknown", label: "Unknown" },
    { value: "wanted", label: "Wanted" },
    { value: "arrested", label: "Arrested" },
    { value: "identified", label: "Identified" },
  ],
}

// Enhanced Utility functions
const DummyDataUtils = {
  // Get all users
  getAllUsers: () => DUMMY_DATA.users,

  // Get users by role
  getUsersByRole: (role) => DUMMY_DATA.users.filter((user) => user.role === role),

  // Get active officers
  getActiveOfficers: () => DUMMY_DATA.users.filter((user) => user.role === "police" && user.status === "active"),

  // Get all stations
  getAllStations: () => DUMMY_DATA.stations,

  // Get station by ID
  getStationById: (stationId) => DUMMY_DATA.stations.find((station) => station.id === stationId),

  // Get all cases
  getAllCases: () => DUMMY_DATA.cases,

  // Get cases by status
  getCasesByStatus: (status) => DUMMY_DATA.cases.filter((case_) => case_.status === status),

  // Get cases by type
  getCasesByType: (type) => DUMMY_DATA.cases.filter((case_) => case_.caseType === type),

  // Get cases by station
  getCasesByStation: (stationId) => DUMMY_DATA.cases.filter((case_) => case_.stationId === stationId),

  // Get cases assigned to officer
  getCasesByOfficer: (officerName) => DUMMY_DATA.cases.filter((case_) => case_.assignedOfficer === officerName),

  // Get recent cases (last N cases)
  getRecentCases: (limit = 5) => {
    return DUMMY_DATA.cases.sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled)).slice(0, limit)
  },

  // Get case statistics
  getCaseStats: () => {
    const cases = DUMMY_DATA.cases
    return {
      total: cases.length,
      open: cases.filter((c) => c.status === "open").length,
      "in-progress": cases.filter((c) => c.status === "in-progress").length,
      closed: cases.filter((c) => c.status === "closed").length,
      pending: cases.filter((c) => c.status === "pending").length,
    }
  },

  // Get case type distribution
  getCaseTypeDistribution: () => {
    const cases = DUMMY_DATA.cases
    const distribution = {}
    cases.forEach((case_) => {
      distribution[case_.caseType] = (distribution[case_.caseType] || 0) + 1
    })
    return Object.entries(distribution).map(([type, count]) => ({ type, count }))
  },

  // Get station performance
  getStationPerformance: () => {
    const cases = DUMMY_DATA.cases
    const performance = {}
    cases.forEach((case_) => {
      const station = DummyDataUtils.getStationById(case_.stationId)
      const stationName = station ? station.stationName : "Unknown"
      performance[stationName] = (performance[stationName] || 0) + 1
    })
    return Object.entries(performance).map(([station, count]) => ({ station, count }))
  },

  // Advanced search cases
  searchCases: (criteria) => {
    let results = DUMMY_DATA.cases

    if (criteria.caseId) {
      results = results.filter((case_) => case_.caseId.toLowerCase().includes(criteria.caseId.toLowerCase()))
    }

    if (criteria.firNumber) {
      results = results.filter((case_) => case_.firNumber.toLowerCase().includes(criteria.firNumber.toLowerCase()))
    }

    if (criteria.victimName) {
      results = results.filter((case_) => case_.victim.name.toLowerCase().includes(criteria.victimName.toLowerCase()))
    }

    if (criteria.suspectName) {
      results = results.filter((case_) => case_.suspect.name.toLowerCase().includes(criteria.suspectName.toLowerCase()))
    }

    if (criteria.dateFrom) {
      results = results.filter((case_) => new Date(case_.dateFiled) >= new Date(criteria.dateFrom))
    }

    if (criteria.dateTo) {
      results = results.filter((case_) => new Date(case_.dateFiled) <= new Date(criteria.dateTo))
    }

    if (criteria.caseType) {
      results = results.filter((case_) => case_.caseType === criteria.caseType)
    }

    if (criteria.status) {
      results = results.filter((case_) => case_.status === criteria.status)
    }

    return results
  },

  // Get user by credentials
  getUserByCredentials: (username, role) => {
    return DUMMY_DATA.users.find((user) => user.username === username && user.role === role)
  },

  // Get case by ID
  getCaseById: (id) => {
    return DUMMY_DATA.cases.find((case_) => case_.id === id || case_.caseId === id)
  },

  // Get user by ID
  getUserById: (id) => {
    return DUMMY_DATA.users.find((user) => user.id == id)
  },

  // Generate new case ID
  generateCaseId: () => {
    const year = new Date().getFullYear()
    const existingIds = DUMMY_DATA.cases.map((c) => c.caseId)
    let counter = 1
    let newId
    do {
      newId = `CR-${year}-${counter.toString().padStart(4, "0")}`
      counter++
    } while (existingIds.includes(newId))
    return newId
  },

  // Generate FIR Number
  generateFirNumber: () => {
    const year = new Date().getFullYear()
    const existingFirs = DUMMY_DATA.cases.map((c) => c.firNumber)
    let counter = 1
    let newFir
    do {
      newFir = `FIR/${year}/${counter.toString().padStart(3, "0")}`
      counter++
    } while (existingFirs.includes(newFir))
    return newFir
  },

  // Add new case
  addCase: (caseData) => {
    const newCase = {
      ...caseData,
      id: (DUMMY_DATA.cases.length + 1).toString(),
      caseId: caseData.caseId || DummyDataUtils.generateCaseId(),
      firNumber: caseData.firNumber || DummyDataUtils.generateFirNumber(),
      dateFiled: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }
    DUMMY_DATA.cases.push(newCase)
    return newCase
  },

  // Add new user
  addUser: (userData) => {
    const newUser = {
      ...userData,
      id: DUMMY_DATA.users.length + 1,
      createdAt: new Date().toISOString(),
      status: "active",
    }
    DUMMY_DATA.users.push(newUser)
    return newUser
  },

  // Add new station
  addStation: (stationData) => {
    const newStation = {
      ...stationData,
      id: stationData.stationCode,
      createdAt: new Date().toISOString(),
    }
    DUMMY_DATA.stations.push(newStation)
    return newStation
  },

  // Update case
  updateCase: (caseId, updates) => {
    const caseIndex = DUMMY_DATA.cases.findIndex((c) => c.id === caseId || c.caseId === caseId)
    if (caseIndex !== -1) {
      DUMMY_DATA.cases[caseIndex] = {
        ...DUMMY_DATA.cases[caseIndex],
        ...updates,
        lastUpdated: new Date().toISOString(),
      }
      return DUMMY_DATA.cases[caseIndex]
    }
    return null
  },

  // Delete case
  deleteCase: (caseId) => {
    const caseIndex = DUMMY_DATA.cases.findIndex((c) => c.id === caseId || c.caseId === caseId)
    if (caseIndex !== -1) {
      return DUMMY_DATA.cases.splice(caseIndex, 1)[0]
    }
    return null
  },

  // Get monthly trends (last 6 months)
  getMonthlyTrends: () => {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const filteredCases = DUMMY_DATA.cases.filter((case_) => new Date(case_.dateFiled) >= sixMonthsAgo)

    const monthlyData = {}
    filteredCases.forEach((case_) => {
      const date = new Date(case_.dateFiled)
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1
    })

    return Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
  },
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = { DUMMY_DATA, DummyDataUtils }
} else if (typeof window !== "undefined") {
  window.DUMMY_DATA = DUMMY_DATA
  window.DummyDataUtils = DummyDataUtils
}
