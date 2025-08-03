const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`)

    // Create indexes for better performance
    await createIndexes()

    // Create default admin user
    await createDefaultAdmin()
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`)
    process.exit(1)
  }
}

const createIndexes = async () => {
  try {
    const User = require("../models/User")
    const Case = require("../models/Case")

    // Create indexes for User model
    await User.collection.createIndex({ username: 1, role: 1 }, { unique: true })
    await User.collection.createIndex({ email: 1 })

    // Create indexes for Case model
    await Case.collection.createIndex({ caseId: 1 }, { unique: true })
    await Case.collection.createIndex({ status: 1 })
    await Case.collection.createIndex({ type: 1 })
    await Case.collection.createIndex({ priority: 1 })
    await Case.collection.createIndex({ createdAt: -1 })
    await Case.collection.createIndex({ assignedOfficer: 1 })

    console.log("📊 Database indexes created successfully")
  } catch (error) {
    console.error("❌ Error creating indexes:", error.message)
  }
}

const createDefaultAdmin = async () => {
  try {
    const User = require("../models/User")
    const bcrypt = require("bcryptjs")

    const adminExists = await User.findOne({ username: "admin", role: "admin" })

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 12)

      const admin = new User({
        username: "admin",
        password: hashedPassword,
        role: "admin",
        fullName: "System Administrator",
        email: "admin@crms.com",
        status: "active",
        permissions: ["all"],
      })

      await admin.save()
      console.log("👤 Default admin user created successfully")

      // Create sample police officers
      const officers = [
        {
          username: "officer1",
          password: await bcrypt.hash("police123", 12),
          role: "police",
          fullName: "John Smith",
          email: "john.smith@crms.com",
          badgeNumber: "P001",
          department: "Criminal Investigation",
          status: "active",
        },
        {
          username: "officer2",
          password: await bcrypt.hash("police123", 12),
          role: "police",
          fullName: "Jane Doe",
          email: "jane.doe@crms.com",
          badgeNumber: "P002",
          department: "Patrol Division",
          status: "active",
        },
      ]

      for (const officer of officers) {
        const officerExists = await User.findOne({ username: officer.username })
        if (!officerExists) {
          await User.create(officer)
        }
      }

      console.log("👮 Sample police officers created successfully")
    }
  } catch (error) {
    console.error("❌ Error creating default users:", error.message)
  }
}

module.exports = connectDB
