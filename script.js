//import { Chart } from "@/components/ui/chart"
// Application State
let currentUser = null
let currentView = "overview"
let currentStep = 1
let cases = []
let users = []
let stations = []

// API Configuration - Replace with your backend URL
const API_BASE_URL = "http://localhost:3000/api" // You'll need to create this backend

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  // Check if user is already logged in
  const savedUser = localStorage.getItem("crms_user")
  if (savedUser) {
    currentUser = JSON.parse(savedUser)
    showDashboard()
  } else {
    showLogin()
  }

  // Setup event listeners
  setupEventListeners()
}

function setupEventListeners() {
  // Login form
  document.getElementById("loginForm").addEventListener("submit", handleLogin)

  // Logout button
  document.getElementById("logoutBtn").addEventListener("click", handleLogout)

  // Navigation links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", handleNavigation)
  })

  // Multi-step form navigation
  document.getElementById("nextBtn").addEventListener("click", nextStep)
  document.getElementById("prevBtn").addEventListener("click", prevStep)
  document.getElementById("addCaseForm").addEventListener("submit", handleAddCase)

  // Case type change handler
  document.getElementById("caseType").addEventListener("change", handleCaseTypeChange)

  // Evidence file upload
  document.getElementById("evidenceFiles").addEventListener("change", handleEvidenceUpload)

  // Search and filter
  document.getElementById("caseSearch").addEventListener("input", filterCases)
  document.getElementById("statusFilter").addEventListener("change", filterCases)
  document.getElementById("typeFilter").addEventListener("change", filterCases)

  // Advanced search
  document.getElementById("advancedSearchForm").addEventListener("submit", handleAdvancedSearch)
  document.getElementById("clearSearch").addEventListener("click", clearAdvancedSearch)

  // Add forms
  document.getElementById("addUserForm").addEventListener("submit", handleAddUser)
  document.getElementById("addStationForm").addEventListener("submit", handleAddStation)

  // Modal controls
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", closeModal)
  })

  // Add buttons
  document.getElementById("addUserBtn").addEventListener("click", () => {
    document.getElementById("userModal").style.display = "block"
  })

  document.getElementById("addStationBtn").addEventListener("click", () => {
    document.getElementById("stationModal").style.display = "block"
  })

  // Generate report button
  document.getElementById("generateReport").addEventListener("click", generateReport)

  // Close modals when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) {
      event.target.style.display = "none"
    }
  })
}

// Authentication Functions
async function handleLogin(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const credentials = {
    username: formData.get("username"),
    password: formData.get("password"),
    role: formData.get("role"),
  }

  try {
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]')
    const originalText = submitBtn.textContent
    submitBtn.textContent = "Logging in..."
    submitBtn.disabled = true

    // In a real application, this would be an API call
    const response = await mockLogin(credentials)

    if (response.success) {
      currentUser = response.user
      localStorage.setItem("crms_user", JSON.stringify(currentUser))
      showAlert("Login successful!", "success")
      setTimeout(() => {
        showDashboard()
      }, 1000)
    } else {
      showError("loginError", response.message)
    }
  } catch (error) {
    showError("loginError", "Login failed. Please try again.")
  } finally {
    // Reset button state
    const submitBtn = event.target.querySelector('button[type="submit"]')
    submitBtn.textContent = "Login"
    submitBtn.disabled = false
  }
}

// Mock login function - Replace with actual API call
async function mockLogin(credentials) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const allUsers = getAllUsers()
  const user = allUsers.find(
    (u) => u.username === credentials.username && u.role === credentials.role && u.password === credentials.password,
  )

  if (user) {
    return {
      success: true,
      user: { ...user, password: undefined }, // Don't return password
    }
  } else {
    return {
      success: false,
      message: "Invalid credentials. Please check your username, password, and role.",
    }
  }
}

function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    currentUser = null
    localStorage.removeItem("crms_user")
    showAlert("Logged out successfully!", "info")
    setTimeout(() => {
      showLogin()
    }, 1000)
  }
}

// Page Navigation
function showLogin() {
  document.getElementById("loginPage").classList.add("active")
  document.getElementById("dashboardPage").classList.remove("active")
  document.body.classList.remove("admin", "police")
}

function showDashboard() {
  document.getElementById("loginPage").classList.remove("active")
  document.getElementById("dashboardPage").classList.add("active")

  // Setup user interface based on role
  setupUserInterface()

  // Load initial data
  loadDashboardData()
}

function setupUserInterface() {
  document.getElementById("userWelcome").textContent = `Welcome, ${currentUser.fullName}`

  // Show/hide role-based elements
  document.body.classList.remove("admin", "police")
  document.body.classList.add(currentUser.role)

  // Show appropriate navigation items
  const addCaseNavItem = document.querySelector('[data-view="add-case"]').parentElement
  if (currentUser.role === "police" || currentUser.role === "admin") {
    addCaseNavItem.style.display = "list-item"
  } else {
    addCaseNavItem.style.display = "none"
  }
}

function handleNavigation(event) {
  event.preventDefault()

  const viewName = event.target.getAttribute("data-view")
  if (viewName) {
    // Check permissions
    if (!hasPermission(viewName)) {
      showAlert("You don't have permission to access this section.", "error")
      return
    }

    showView(viewName)

    // Update active nav link
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active")
    })
    event.target.classList.add("active")
  }
}

function hasPermission(viewName) {
  const adminOnlyViews = ["users", "stations", "reports"]
  const policeViews = ["overview", "cases", "add-case", "search"]

  if (currentUser.role === "admin") {
    return true // Admin has access to everything
  } else if (currentUser.role === "police") {
    return policeViews.includes(viewName)
  }

  return false
}

function showView(viewName) {
  // Hide all views
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.remove("active")
  })

  // Show selected view
  const targetView = document.getElementById(viewName + "View")
  if (targetView) {
    targetView.classList.add("active")
    currentView = viewName

    // Load view-specific data
    switch (viewName) {
      case "overview":
        loadOverviewData()
        break
      case "cases":
        loadCasesData()
        break
      case "users":
        if (currentUser.role === "admin") {
          loadUsersData()
        }
        break
      case "stations":
        if (currentUser.role === "admin") {
          loadStationsData()
        }
        break
      case "reports":
        if (currentUser.role === "admin") {
          loadReportsData()
        }
        break
      case "add-case":
        if (currentUser.role === "police" || currentUser.role === "admin") {
          initializeAddCaseForm()
        }
        break
      case "search":
        // Search view is ready
        break
    }
  }
}

// Multi-step Form Functions
function initializeAddCaseForm() {
  // Reset form
  currentStep = 1
  document.getElementById("addCaseForm").reset()

  // Generate new case ID and FIR number
  document.getElementById("caseId").value = generateCaseId()
  document.getElementById("firNumber").value = generateFirNumber()

  // Load stations and officers
  loadStationsForForm()
  loadOfficersForAssignment()

  // Reset form steps
  showFormStep(1)
}

function showFormStep(step) {
  // Hide all steps
  document.querySelectorAll(".form-step").forEach((stepEl) => {
    stepEl.classList.remove("active")
  })

  // Show current step
  const currentStepEl = document.querySelector(`.form-step[data-step="${step}"]`)
  if (currentStepEl) {
    currentStepEl.classList.add("active")
  }

  // Update progress indicators
  document.querySelectorAll(".progress-step").forEach((progressEl, index) => {
    if (index + 1 <= step) {
      progressEl.classList.add("active")
    } else {
      progressEl.classList.remove("active")
    }
  })

  // Update navigation buttons
  const prevBtn = document.getElementById("prevBtn")
  const nextBtn = document.getElementById("nextBtn")
  const submitBtn = document.getElementById("submitBtn")

  if (step === 1) {
    prevBtn.style.display = "none"
    nextBtn.style.display = "inline-block"
    submitBtn.style.display = "none"
  } else if (step === 5) {
    prevBtn.style.display = "inline-block"
    nextBtn.style.display = "none"
    submitBtn.style.display = "inline-block"
  } else {
    prevBtn.style.display = "inline-block"
    nextBtn.style.display = "inline-block"
    submitBtn.style.display = "none"
  }

  currentStep = step
}

function nextStep() {
  if (validateCurrentStep() && currentStep < 5) {
    showFormStep(currentStep + 1)
  }
}

function prevStep() {
  if (currentStep > 1) {
    showFormStep(currentStep - 1)
  }
}

function validateCurrentStep() {
  const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`)
  const requiredFields = currentStepEl.querySelectorAll("[required]")

  for (const field of requiredFields) {
    if (!field.value.trim()) {
      field.focus()
      showAlert("Please fill in all required fields before proceeding.", "warning")
      return false
    }
  }

  // Additional validation for specific steps
  if (currentStep === 2) {
    const age = document.getElementById("victimAge").value
    if (age && (age < 0 || age > 150)) {
      showAlert("Please enter a valid age for the victim.", "warning")
      return false
    }
  }

  if (currentStep === 4) {
    const incidentDate = new Date(document.getElementById("incidentDate").value)
    const today = new Date()
    if (incidentDate > today) {
      showAlert("Incident date cannot be in the future.", "warning")
      return false
    }
  }

  return true
}

function handleCaseTypeChange(event) {
  const otherGroup = document.getElementById("otherCaseTypeGroup")
  const otherInput = document.getElementById("otherCaseType")

  if (event.target.value === "other") {
    otherGroup.style.display = "block"
    otherInput.required = true
  } else {
    otherGroup.style.display = "none"
    otherInput.required = false
    otherInput.value = ""
  }
}

function handleEvidenceUpload(event) {
  const files = event.target.files
  const preview = document.getElementById("evidencePreview")
  preview.innerHTML = ""

  if (files.length === 0) return

  Array.from(files).forEach((file, index) => {
    const item = document.createElement("div")
    item.className = "evidence-item"

    if (file.type.startsWith("image/")) {
      const img = document.createElement("img")
      img.src = URL.createObjectURL(file)
      img.onload = () => URL.revokeObjectURL(img.src) // Clean up
      item.appendChild(img)
    } else {
      const icon = document.createElement("i")
      if (file.type.includes("pdf")) {
        icon.className = "fas fa-file-pdf"
        icon.style.color = "#ef4444"
      } else if (file.type.includes("video")) {
        icon.className = "fas fa-file-video"
        icon.style.color = "#8b5cf6"
      } else if (file.type.includes("audio")) {
        icon.className = "fas fa-file-audio"
        icon.style.color = "#10b981"
      } else {
        icon.className = "fas fa-file"
        icon.style.color = "#64748b"
      }
      icon.style.fontSize = "3rem"
      item.appendChild(icon)
    }

    const fileName = document.createElement("div")
    fileName.className = "file-name"
    fileName.textContent = file.name
    item.appendChild(fileName)

    const fileSize = document.createElement("div")
    fileSize.style.fontSize = "0.7rem"
    fileSize.style.color = "#64748b"
    fileSize.textContent = formatFileSize(file.size)
    item.appendChild(fileSize)

    preview.appendChild(item)
  })
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Data Loading Functions
async function loadDashboardData() {
  try {
    showLoadingState()

    // Load cases
    cases = await fetchCases()

    // Load users if admin
    if (currentUser.role === "admin") {
      users = await fetchUsers()
      stations = await fetchStations()
    } else {
      stations = await fetchStations() // Police officers also need stations for case filing
    }

    // Update overview
    loadOverviewData()

    hideLoadingState()
  } catch (error) {
    console.error("Error loading dashboard data:", error)
    showAlert("Error loading dashboard data. Please refresh the page.", "error")
    hideLoadingState()
  }
}

function showLoadingState() {
  const mainContent = document.querySelector(".main-content")
  const loadingDiv = document.createElement("div")
  loadingDiv.id = "loadingState"
  loadingDiv.className = "loading"
  loadingDiv.innerHTML = '<i class="fas fa-spinner"></i><p>Loading data...</p>'
  mainContent.appendChild(loadingDiv)
}

function hideLoadingState() {
  const loadingState = document.getElementById("loadingState")
  if (loadingState) {
    loadingState.remove()
  }
}

async function loadOverviewData() {
  // Calculate statistics
  const stats = calculateCaseStats(cases)

  // Update stat cards with animation
  animateCounter("totalCases", stats.total)
  animateCounter("openCases", stats.open)
  animateCounter("closedCases", stats.closed)
  animateCounter("inProgressCases", stats["in-progress"])

  // Load recent cases
  loadRecentCases()
}

function animateCounter(elementId, targetValue) {
  const element = document.getElementById(elementId)
  const startValue = 0
  const duration = 1000
  const startTime = performance.now()

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const currentValue = Math.floor(startValue + (targetValue - startValue) * progress)

    element.textContent = currentValue

    if (progress < 1) {
      requestAnimationFrame(updateCounter)
    }
  }

  requestAnimationFrame(updateCounter)
}

function calculateCaseStats(cases) {
  return getCaseStats()
}

function loadRecentCases() {
  const recentCases = cases.sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled)).slice(0, 5)

  const tbody = document.querySelector("#recentCasesTable tbody")
  tbody.innerHTML = ""

  if (recentCases.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center" style="padding: 2rem; color: #64748b;">No cases found</td></tr>'
    return
  }

  recentCases.forEach((case_) => {
    const row = createCaseRow(case_, true)
    tbody.appendChild(row)
  })
}

async function loadCasesData() {
  const tbody = document.querySelector("#casesTable tbody")
  tbody.innerHTML = ""

  if (cases.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: #64748b;">No cases found</td></tr>'
    return
  }

  cases.forEach((case_) => {
    const row = createCaseRow(case_, false)
    tbody.appendChild(row)
  })
}

function createCaseRow(case_, isRecent = false) {
  const row = document.createElement("tr")

  const columns = isRecent
    ? ["caseId", "firNumber", "caseType", "victimName", "status", "dateFiled"]
    : ["caseId", "firNumber", "caseType", "victimName", "suspectName", "status", "stationName", "dateFiled", "actions"]

  columns.forEach((column) => {
    const cell = document.createElement("td")

    switch (column) {
      case "caseId":
        cell.textContent = case_.caseId
        cell.style.fontWeight = "600"
        cell.style.color = "#1e293b"
        break
      case "firNumber":
        cell.textContent = case_.firNumber
        break
      case "caseType":
        const typeLabel = getCaseTypeLabel(case_.caseType)
        cell.innerHTML = `<span class="status-badge type-${case_.caseType}">${typeLabel}</span>`
        break
      case "victimName":
        cell.textContent = case_.victim.name
        break
      case "suspectName":
        cell.textContent = case_.suspect.name || "Unknown"
        if (case_.suspect.name === "Unknown") {
          cell.style.color = "#64748b"
          cell.style.fontStyle = "italic"
        }
        break
      case "status":
        const statusLabel = getStatusLabel(case_.status)
        cell.innerHTML = `<span class="status-badge status-${case_.status}">${statusLabel}</span>`
        break
      case "stationName":
        const station = getStationById(case_.stationId)
        cell.textContent = station ? station.stationName : "Unknown"
        break
      case "dateFiled":
        cell.textContent = new Date(case_.dateFiled).toLocaleDateString()
        break
      case "actions":
        cell.innerHTML = `
          <button class="action-btn btn-view" onclick="viewCase('${case_.id}')">
            <i class="fas fa-eye"></i> View
          </button>
          ${
            currentUser.role === "admin" || case_.assignedOfficer === currentUser.fullName
              ? `<button class="action-btn btn-edit" onclick="editCase('${case_.id}')">
              <i class="fas fa-edit"></i> Edit
            </button>`
              : ""
          }
          ${
            currentUser.role === "admin"
              ? `<button class="action-btn btn-delete" onclick="deleteCase('${case_.id}')">
              <i class="fas fa-trash"></i> Delete
            </button>`
              : ""
          }
        `
        break
    }

    row.appendChild(cell)
  })

  return row
}

// Case Management Functions
async function handleAddCase(event) {
  event.preventDefault()

  if (!validateCurrentStep()) {
    return
  }

  const formData = new FormData(event.target)
  const submitBtn = document.getElementById("submitBtn")

  // Show loading state
  const originalText = submitBtn.textContent
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Filing Case...'
  submitBtn.disabled = true

  try {
    // Build case data object
    const caseData = {
      caseId: formData.get("caseId"),
      firNumber: formData.get("firNumber"),
      caseType: formData.get("caseType") === "other" ? formData.get("otherCaseType") : formData.get("caseType"),
      stationId: formData.get("station"),
      victim: {
        name: formData.get("victimName"),
        gender: formData.get("victimGender"),
        age: Number.parseInt(formData.get("victimAge")),
        address: formData.get("victimAddress"),
        contact: formData.get("victimContact"),
        email: formData.get("victimEmail") || "",
      },
      suspect: {
        name: formData.get("suspectName") || "Unknown",
        gender: formData.get("suspectGender") || "",
        age: formData.get("suspectAge") ? Number.parseInt(formData.get("suspectAge")) : 0,
        address: formData.get("suspectAddress") || "",
        contact: formData.get("suspectContact") || "",
        status: formData.get("suspectStatus"),
      },
      incidentDetails: {
        description: formData.get("incidentDescription"),
        location: formData.get("incidentLocation"),
        incidentDateTime: formData.get("incidentDate") + "T" + (formData.get("incidentTime") || "00:00"),
        witnessStatements: formData.get("witnessStatements") ? [formData.get("witnessStatements")] : [],
        evidence: [], // File handling would be implemented here
      },
      status: formData.get("caseStatus"),
      assignedOfficer: formData.get("assignedOfficer"),
      filedBy: currentUser.id,
      createdBy: currentUser.id,
    }

    const response = await createCase(caseData)
    if (response.success) {
      showAlert("Case filed successfully! Case ID: " + response.case.caseId, "success")
      event.target.reset()
      initializeAddCaseForm()

      // Reload cases data
      cases = await fetchCases()
      if (currentView === "cases") {
        loadCasesData()
      }
      loadOverviewData() // Update stats
    }
  } catch (error) {
    showAlert("Error filing case: " + error.message, "error")
  } finally {
    // Reset button state
    submitBtn.textContent = originalText
    submitBtn.disabled = false
  }
}

async function loadStationsForForm() {
  const stationSelect = document.getElementById("station")
  const userStationSelect = document.getElementById("userStation")

  stationSelect.innerHTML = '<option value="">Select Station</option>'
  if (userStationSelect) {
    userStationSelect.innerHTML = '<option value="">Select Station</option>'
  }

  stations.forEach((station) => {
    const option = document.createElement("option")
    option.value = station.id
    option.textContent = `${station.stationCode} - ${station.stationName}`
    stationSelect.appendChild(option)

    if (userStationSelect) {
      const userOption = option.cloneNode(true)
      userStationSelect.appendChild(userOption)
    }
  })
}

async function loadOfficersForAssignment() {
  const select = document.getElementById("assignedOfficer")
  select.innerHTML = '<option value="">Select Officer</option>'

  const officers = getActiveOfficers()

  officers.forEach((officer) => {
    const option = document.createElement("option")
    option.value = officer.fullName
    option.textContent = `${officer.fullName} (${officer.badgeNumber}) - ${officer.department}`
    select.appendChild(option)
  })

  // Auto-select current user if they are a police officer
  if (currentUser.role === "police") {
    select.value = currentUser.fullName
  }
}

// Search Functions
function handleAdvancedSearch(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const criteria = {
    caseId: formData.get("searchCaseId"),
    firNumber: formData.get("searchFirNumber"),
    victimName: formData.get("searchVictimName"),
    suspectName: formData.get("searchSuspectName"),
    dateFrom: formData.get("searchDateFrom"),
    dateTo: formData.get("searchDateTo"),
  }

  // Remove empty criteria
  Object.keys(criteria).forEach((key) => {
    if (!criteria[key]) {
      delete criteria[key]
    }
  })

  if (Object.keys(criteria).length === 0) {
    showAlert("Please enter at least one search criteria.", "warning")
    return
  }

  const results = searchCases(criteria)
  displaySearchResults(results)
}

function displaySearchResults(results) {
  const resultsDiv = document.getElementById("searchResults")
  const tbody = document.querySelector("#searchResultsTable tbody")

  tbody.innerHTML = ""

  if (results.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #64748b;">No cases found matching your criteria</td></tr>'
  } else {
    results.forEach((case_) => {
      const row = createCaseRow(case_, false)
      tbody.appendChild(row)
    })
  }

  resultsDiv.style.display = "block"

  // Scroll to results
  resultsDiv.scrollIntoView({ behavior: "smooth" })

  showAlert(`Found ${results.length} case(s) matching your criteria.`, "info")
}

function clearAdvancedSearch() {
  document.getElementById("advancedSearchForm").reset()
  document.getElementById("searchResults").style.display = "none"
}

// Filter Functions
function filterCases() {
  const searchTerm = document.getElementById("caseSearch").value.toLowerCase()
  const statusFilter = document.getElementById("statusFilter").value
  const typeFilter = document.getElementById("typeFilter").value

  const filteredCases = cases.filter((case_) => {
    const matchesSearch =
      case_.caseId.toLowerCase().includes(searchTerm) ||
      case_.firNumber.toLowerCase().includes(searchTerm) ||
      case_.victim.name.toLowerCase().includes(searchTerm) ||
      case_.suspect.name.toLowerCase().includes(searchTerm)

    const matchesStatus = !statusFilter || case_.status === statusFilter
    const matchesType = !typeFilter || case_.caseType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Update table with filtered cases
  const tbody = document.querySelector("#casesTable tbody")
  tbody.innerHTML = ""

  if (filteredCases.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: #64748b;">No cases match your filter criteria</td></tr>'
  } else {
    filteredCases.forEach((case_) => {
      const row = createCaseRow(case_, false)
      tbody.appendChild(row)
    })
  }
}

// User Management Functions
async function handleAddUser(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const submitBtn = event.target.querySelector('button[type="submit"]')

  // Show loading state
  const originalText = submitBtn.textContent
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding User...'
  submitBtn.disabled = true

  try {
    const userData = {
      username: formData.get("username"),
      password: formData.get("password"),
      role: formData.get("role"),
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      badgeNumber: formData.get("badgeNumber"),
      station: formData.get("station"),
      status: "active",
    }

    const response = await createUser(userData)
    if (response.success) {
      showAlert("User added successfully!", "success")
      event.target.reset()
      closeModal()
      // Reload users data
      users = await fetchUsers()
      if (currentView === "users") {
        loadUsersData()
      }
    }
  } catch (error) {
    showAlert("Error adding user: " + error.message, "error")
  } finally {
    // Reset button state
    submitBtn.textContent = originalText
    submitBtn.disabled = false
  }
}

async function loadUsersData() {
  const tbody = document.querySelector("#usersTable tbody")
  tbody.innerHTML = ""

  if (users.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #64748b;">No users found</td></tr>'
    return
  }

  users.forEach((user) => {
    const station = getStationById(user.station)
    const row = document.createElement("tr")
    row.innerHTML = `
      <td style="font-weight: 600;">${user.id}</td>
      <td>${user.username}</td>
      <td><span class="status-badge status-${user.role}">${user.role.toUpperCase()}</span></td>
      <td>${user.fullName}</td>
      <td>${user.badgeNumber || "N/A"}</td>
      <td>${station ? station.stationName : "N/A"}</td>
      <td><span class="status-badge status-${user.status}">${user.status.toUpperCase()}</span></td>
      <td>
        <button class="action-btn btn-edit" onclick="editUser('${user.id}')">
          <i class="fas fa-edit"></i> Edit
        </button>
        ${
          user.id !== currentUser.id
            ? `<button class="action-btn btn-delete" onclick="deleteUser('${user.id}')">
            <i class="fas fa-trash"></i> Delete
          </button>`
            : ""
        }
      </td>
    `
    tbody.appendChild(row)
  })
}

// Station Management Functions
async function handleAddStation(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const submitBtn = event.target.querySelector('button[type="submit"]')

  // Show loading state
  const originalText = submitBtn.textContent
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Station...'
  submitBtn.disabled = true

  try {
    const stationData = {
      stationCode: formData.get("stationCode"),
      stationName: formData.get("stationName"),
      address: formData.get("stationAddress"),
      contact: formData.get("stationContact"),
      inCharge: formData.get("stationInCharge"),
    }

    const response = await createStation(stationData)
    if (response.success) {
      showAlert("Station added successfully!", "success")
      event.target.reset()
      closeModal()
      // Reload stations data
      stations = await fetchStations()
      if (currentView === "stations") {
        loadStationsData()
      }
      // Update form dropdowns
      loadStationsForForm()
    }
  } catch (error) {
    showAlert("Error adding station: " + error.message, "error")
  } finally {
    // Reset button state
    submitBtn.textContent = originalText
    submitBtn.disabled = false
  }
}

async function loadStationsData() {
  const tbody = document.querySelector("#stationsTable tbody")
  tbody.innerHTML = ""

  if (stations.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #64748b;">No stations found</td></tr>'
    return
  }

  stations.forEach((station) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td style="font-weight: 600;">${station.stationCode}</td>
      <td>${station.stationName}</td>
      <td>${station.address}</td>
      <td>${station.contact}</td>
      <td>${station.inCharge}</td>
      <td>
        <button class="action-btn btn-edit" onclick="editStation('${station.id}')">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="action-btn btn-delete" onclick="deleteStation('${station.id}')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </td>
    `
    tbody.appendChild(row)
  })
}

// Modal Functions
function closeModal() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.style.display = "none"
  })
}

function viewCase(caseId) {
  const case_ = cases.find((c) => c.id === caseId)
  if (case_) {
    const modal = document.getElementById("caseModal")
    const detailsDiv = document.getElementById("caseDetails")
    const station = getStationById(case_.stationId)

    detailsDiv.innerHTML = `
      <div class="case-detail-section">
        <h4><i class="fas fa-info-circle"></i> Basic Information</h4>
        <div class="case-detail-grid">
          <div><strong>Case ID:</strong> ${case_.caseId}</div>
          <div><strong>FIR Number:</strong> ${case_.firNumber}</div>
          <div><strong>Case Type:</strong> ${getCaseTypeLabel(case_.caseType)}</div>
          <div><strong>Status:</strong> <span class="status-badge status-${case_.status}">${getStatusLabel(case_.status)}</span></div>
          <div><strong>Station:</strong> ${station ? station.stationName : "Unknown"}</div>
          <div><strong>Date Filed:</strong> ${new Date(case_.dateFiled).toLocaleString()}</div>
        </div>
      </div>
      
      <div class="case-detail-section">
        <h4><i class="fas fa-user"></i> Victim Information</h4>
        <div class="case-detail-grid">
          <div><strong>Name:</strong> ${case_.victim.name}</div>
          <div><strong>Gender:</strong> ${case_.victim.gender}</div>
          <div><strong>Age:</strong> ${case_.victim.age}</div>
          <div><strong>Contact:</strong> ${case_.victim.contact}</div>
          <div class="full-width"><strong>Address:</strong> ${case_.victim.address}</div>
          ${case_.victim.email ? `<div><strong>Email:</strong> ${case_.victim.email}</div>` : ""}
        </div>
      </div>
      
      <div class="case-detail-section">
        <h4><i class="fas fa-user-secret"></i> Suspect Information</h4>
        <div class="case-detail-grid">
          <div><strong>Name:</strong> ${case_.suspect.name}</div>
          <div><strong>Gender:</strong> ${case_.suspect.gender || "Unknown"}</div>
          <div><strong>Age:</strong> ${case_.suspect.age || "Unknown"}</div>
          <div><strong>Status:</strong> <span class="status-badge">${case_.suspect.status}</span></div>
          ${case_.suspect.address ? `<div class="full-width"><strong>Address:</strong> ${case_.suspect.address}</div>` : ""}
          ${case_.suspect.contact ? `<div><strong>Contact:</strong> ${case_.suspect.contact}</div>` : ""}
        </div>
      </div>
      
      <div class="case-detail-section">
        <h4><i class="fas fa-map-marker-alt"></i> Incident Details</h4>
        <div class="case-detail-grid">
          <div><strong>Date & Time:</strong> ${new Date(case_.incidentDetails.incidentDateTime).toLocaleString()}</div>
          <div class="full-width"><strong>Location:</strong> ${case_.incidentDetails.location}</div>
          <div class="full-width"><strong>Description:</strong><br>${case_.incidentDetails.description}</div>
          ${case_.incidentDetails.witnessStatements.length > 0 ? `<div class="full-width"><strong>Witness Statements:</strong><br>${case_.incidentDetails.witnessStatements.join("<br>")}</div>` : ""}
          ${case_.incidentDetails.evidence.length > 0 ? `<div class="full-width"><strong>Evidence:</strong><br>${case_.incidentDetails.evidence.join(", ")}</div>` : ""}
        </div>
      </div>
      
      <div class="case-detail-section">
        <h4><i class="fas fa-clipboard-list"></i> Case Management</h4>
        <div class="case-detail-grid">
          <div><strong>Assigned Officer:</strong> ${case_.assignedOfficer}</div>
          <div><strong>Last Updated:</strong> ${new Date(case_.lastUpdated).toLocaleString()}</div>
          <div><strong>Filed By:</strong> ${getUserById(case_.filedBy)?.fullName || "Unknown"}</div>
        </div>
      </div>
    `

    modal.style.display = "block"
  }
}

// Reports and Analytics
async function loadReportsData() {
  generateCharts()
}

function generateReport() {
  const startDate = document.getElementById("startDate").value
  const endDate = document.getElementById("endDate").value

  if (!startDate || !endDate) {
    showAlert("Please select both start and end dates", "warning")
    return
  }

  if (new Date(startDate) > new Date(endDate)) {
    showAlert("Start date cannot be after end date", "warning")
    return
  }

  // Filter cases by date range
  const filteredCases = cases.filter((case_) => {
    const caseDate = new Date(case_.dateFiled)
    return caseDate >= new Date(startDate) && caseDate <= new Date(endDate)
  })

  showAlert(`Generating report for ${filteredCases.length} cases in the selected date range...`, "info")

  // Update charts with filtered data
  generateCharts(filteredCases)
}

function generateCharts(data = cases) {
  // Case Type Chart
  const typeData = {}
  data.forEach((case_) => {
    const typeLabel = getCaseTypeLabel(case_.caseType)
    typeData[typeLabel] = (typeData[typeLabel] || 0) + 1
  })

  createChart("caseTypeChart", "doughnut", {
    labels: Object.keys(typeData),
    datasets: [
      {
        data: Object.values(typeData),
        backgroundColor: ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#06b6d4", "#64748b", "#ec4899"],
        borderWidth: 3,
        borderColor: "#ffffff",
        hoverBorderWidth: 4,
      },
    ],
  })

  // Case Status Chart
  const statusData = {}
  data.forEach((case_) => {
    const statusLabel = getStatusLabel(case_.status)
    statusData[statusLabel] = (statusData[statusLabel] || 0) + 1
  })

  createChart("caseStatusChart", "bar", {
    labels: Object.keys(statusData),
    datasets: [
      {
        label: "Number of Cases",
        data: Object.values(statusData),
        backgroundColor: ["#f59e0b", "#3b82f6", "#10b981", "#ef4444"],
        borderColor: ["#d97706", "#1d4ed8", "#059669", "#dc2626"],
        borderWidth: 2,
        borderRadius: 8,
        maxBarThickness: 80,
      },
    ],
  })

  // Monthly Trends Chart
  createMonthlyTrendsChart(data)

  // Station Performance Chart
  createStationPerformanceChart(data)
}

function createMonthlyTrendsChart(data = cases) {
  const monthlyData = getMonthlyTrends()

  createChart("monthlyTrendChart", "line", {
    labels: monthlyData.map((item) => item.month),
    datasets: [
      {
        label: "Cases per Month",
        data: monthlyData.map((item) => item.count),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  })
}

function createStationPerformanceChart(data = cases) {
  const stationData = {}
  data.forEach((case_) => {
    const station = getStationById(case_.stationId)
    const stationName = station ? station.stationName : "Unknown"
    stationData[stationName] = (stationData[stationName] || 0) + 1
  })

  createChart("stationPerformanceChart", "horizontalBar", {
    labels: Object.keys(stationData),
    datasets: [
      {
        label: "Cases Filed",
        data: Object.values(stationData),
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
        borderColor: ["#1d4ed8", "#059669", "#d97706", "#dc2626", "#7c3aed"],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  })
}

function createChart(canvasId, type, data) {
  const ctx = document.getElementById(canvasId)
  if (ctx) {
    // Destroy existing chart if it exists
    if (ctx.chart) {
      ctx.chart.destroy()
    }

    // Set canvas dimensions
    ctx.style.height = "350px"
    ctx.style.maxHeight = "350px"

    ctx.chart = new Chart(ctx, {
      type: type,
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 15,
              padding: 15,
              font: {
                size: 12,
                weight: "500",
              },
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            borderColor: "#3b82f6",
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
          },
        },
        scales:
          type === "bar" || type === "horizontalBar"
            ? {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    precision: 0,
                    font: {
                      size: 11,
                    },
                  },
                  grid: {
                    color: "rgba(0, 0, 0, 0.1)",
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    font: {
                      size: 11,
                    },
                  },
                },
              }
            : type === "line"
              ? {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      precision: 0,
                    },
                    grid: {
                      color: "rgba(0, 0, 0, 0.1)",
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                }
              : {},
        layout: {
          padding: {
            top: 20,
            bottom: 20,
            left: 20,
            right: 20,
          },
        },
      },
    })
  }
}

// Utility Functions
function showAlert(message, type = "info") {
  // Remove existing alerts
  document.querySelectorAll(".alert").forEach((alert) => alert.remove())

  // Create alert element
  const alert = document.createElement("div")
  alert.className = `alert alert-${type}`
  alert.innerHTML = `
    <i class="fas fa-${getAlertIcon(type)}"></i>
    <span>${message}</span>
  `

  // Add to page
  const mainContent = document.querySelector(".main-content")
  mainContent.insertBefore(alert, mainContent.firstChild)

  // Auto remove after 5 seconds
  setTimeout(() => {
    alert.remove()
  }, 5000)

  // Scroll to top to show alert
  mainContent.scrollTop = 0
}

function getAlertIcon(type) {
  switch (type) {
    case "success":
      return "check-circle"
    case "error":
      return "exclamation-circle"
    case "warning":
      return "exclamation-triangle"
    case "info":
      return "info-circle"
    default:
      return "info-circle"
  }
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId)
  if (errorElement) {
    errorElement.textContent = message
    errorElement.style.display = "block"

    setTimeout(() => {
      errorElement.style.display = "none"
    }, 5000)
  }
}

// API Functions - Replace these with actual API calls to your backend
async function fetchCases() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return getAllCases()
}

async function fetchUsers() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return getAllUsers()
}

async function fetchStations() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return getAllStations()
}

async function createCase(caseData) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const newCase = addCase(caseData)
  return { success: true, case: newCase }
}

async function createUser(userData) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Check if username already exists
  const existingUser = getAllUsers().find((u) => u.username === userData.username)
  if (existingUser) {
    throw new Error("Username already exists")
  }

  const newUser = addUser(userData)
  return { success: true, user: newUser }
}

async function createStation(stationData) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Check if station code already exists
  const existingStation = getAllStations().find((s) => s.stationCode === stationData.stationCode)
  if (existingStation) {
    throw new Error("Station code already exists")
  }

  const newStation = addStation(stationData)
  return { success: true, station: newStation }
}

// Action Functions (called from HTML)
function editCase(caseId) {
  showAlert(
    "Edit case functionality would be implemented here. This would open a form similar to the add case form but pre-populated with existing data.",
    "info",
  )
}

function deleteCase(caseId) {
  if (confirm("Are you sure you want to delete this case? This action cannot be undone.")) {
    cases = cases.filter((c) => c.id !== caseId)
    loadCasesData()
    loadOverviewData()
    showAlert("Case deleted successfully", "success")
  }
}

function editUser(userId) {
  showAlert("Edit user functionality would be implemented here. This would open a form to modify user details.", "info")
}

function deleteUser(userId) {
  const user = users.find((u) => u.id == userId)
  if (user && confirm(`Are you sure you want to delete user "${user.fullName}"? This action cannot be undone.`)) {
    users = users.filter((u) => u.id != userId)
    loadUsersData()
    showAlert("User deleted successfully", "success")
  }
}

function editStation(stationId) {
  showAlert(
    "Edit station functionality would be implemented here. This would open a form to modify station details.",
    "info",
  )
}

function deleteStation(stationId) {
  const station = stations.find((s) => s.id === stationId)
  if (
    station &&
    confirm(`Are you sure you want to delete station "${station.stationName}"? This action cannot be undone.`)
  ) {
    stations = stations.filter((s) => s.id !== stationId)
    loadStationsData()
    loadStationsForForm() // Update form dropdowns
    showAlert("Station deleted successfully", "success")
  }
}

// Initialize tooltips and other UI enhancements
document.addEventListener("DOMContentLoaded", () => {
  // Add smooth scrolling to all anchor links except empty '#'
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href")

      // Skip if only "#"
      if (href === "#") return

      e.preventDefault()
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
        })
      }
    })
  })
})


function generateCaseId() {
  // Mock implementation
  return "CASE001"
}

function generateFirNumber() {
  // Mock implementation
  return "FIR001"
}

function getAllCases() {
  // Mock implementation
  return [
    {
      id: "1",
      caseId: "CASE001",
      firNumber: "FIR001",
      caseType: "theft",
      victim: { name: "Alice" },
      suspect: { name: "Bob" },
      stationId: "1",
      status: "open",
      dateFiled: new Date().toISOString(),
    },
  ]
}

function getAllUsers() {
  return [
    {
      id: "1",
      username: "admin",
      password: "admin123",
      role: "admin",
      fullName: "System Administrator",
      email: "admin@crms.gov",
      badgeNumber: "ADM001",
      station: "1",
      status: "active",
      department: "Administration",
    },
    {
      id: "2",
      username: "officer1",
      password: "police123",
      role: "police",
      fullName: "Officer John Smith",
      email: "j.smith@police.gov",
      badgeNumber: "POL001",
      station: "1",
      status: "active",
      department: "Criminal Investigation",
    },
    {
      id: "3",
      username: "officer2",
      password: "police123",
      role: "police",
      fullName: "Officer Sarah Johnson",
      email: "s.johnson@police.gov",
      badgeNumber: "POL002",
      station: "2",
      status: "active",
      department: "Traffic Division",
    },
    {
      id: "4",
      username: "officer3",
      password: "police123",
      role: "police",
      fullName: "Officer Mike Davis",
      email: "m.davis@police.gov",
      badgeNumber: "POL003",
      station: "1",
      status: "active",
      department: "Patrol Division",
    },
  ]
}

function getAllStations() {
  return [
    {
      id: "1",
      stationCode: "PS001",
      stationName: "Central Police Station",
      address: "123 Main Street, Downtown",
      contact: "+1-555-0101",
      inCharge: "Inspector Robert Wilson",
    },
    {
      id: "2",
      stationCode: "PS002",
      stationName: "North District Police Station",
      address: "456 North Avenue, Uptown",
      contact: "+1-555-0102",
      inCharge: "Inspector Maria Garcia",
    },
    {
      id: "3",
      stationCode: "PS003",
      stationName: "South District Police Station",
      address: "789 South Boulevard, Downtown",
      contact: "+1-555-0103",
      inCharge: "Inspector David Brown",
    },
  ]
}

function addCase(caseData) {
  // Mock implementation
  return { ...caseData, id: "2" }
}

function addUser(userData) {
  // Mock implementation
  return { ...userData, id: "2" }
}

function addStation(stationData) {
  // Mock implementation
  return { ...stationData, id: "2" }
}

function getCaseStats() {
  // Mock implementation
  return { total: 1, open: 1, closed: 0, "in-progress": 0 }
}

function getMonthlyTrends() {
  // Mock implementation
  return [{ month: "January", count: 1 }]
}

function getStationById(id) {
  // Mock implementation
  return stations.find((station) => station.id === id)
}

function getActiveOfficers() {
  const allUsers = getAllUsers()
  return allUsers.filter((user) => user.role === "police" && user.status === "active")
}

function searchCases(criteria) {
  // Mock implementation
  return cases.filter((case_) => {
    let matches = true
    for (const key in criteria) {
      if (criteria[key] && !case_[key].toLowerCase().includes(criteria[key].toLowerCase())) {
        matches = false
        break
      }
    }
    return matches
  })
}

function getCaseTypeLabel(caseType) {
  const caseTypes = [
    { value: "theft", label: "Theft" },
    { value: "assault", label: "Assault" },
    { value: "robbery", label: "Robbery" },
    { value: "other", label: "Other" },
  ]
  return caseTypes.find((t) => t.value === caseType)?.label || caseType
}

function getStatusLabel(status) {
  const statuses = [
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
    { value: "in-progress", label: "In Progress" },
  ]
  return statuses.find((s) => s.value === status)?.label || status
}

function getUserById(id) {
  return users.find((user) => user.id === id)
}
