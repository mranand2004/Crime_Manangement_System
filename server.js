const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

// Import database connection
const connectDB = require("./config/database")

// Import routes
const authRoutes = require("./routes/auth")
const caseRoutes = require("./routes/cases")
const userRoutes = require("./routes/users")
const dashboardRoutes = require("./routes/dashboard")

// Import middleware
const { errorHandler } = require("./middleware/errorHandler")

const app = express()

// Connect to MongoDB Atlas
connectDB()

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
})
app.use("/api/", limiter)

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "CRMS API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// API Routes
// ...existing code...

console.log("Registering /api/auth routes")
app.use("/api/auth", authRoutes)

console.log("Registering /api/cases routes")
app.use("/api/cases", caseRoutes)

console.log("Registering /api/users routes")
app.use("/api/users", userRoutes)

console.log("Registering /api/dashboard routes")
app.use("/api/dashboard", dashboardRoutes)

console.log("Registering 404 handler")
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  })
})

console.log("Registering error handler")
app.use(errorHandler)

// ...existing code...


// Error handling middleware
app.use(errorHandler)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 CRMS Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`)
  process.exit(1)
})

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`❌ Uncaught Exception: ${err.message}`)
  process.exit(1)
})
