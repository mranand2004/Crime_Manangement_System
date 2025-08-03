// Example Node.js/Express backend code for MongoDB Atlas connection
// Save this as a separate backend project

/*
// package.json dependencies needed:
{
  "express": "^4.18.2",
  "mongoose": "^7.5.0",
  "cors": "^2.8.5",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "dotenv": "^16.3.1"
}

// .env file:
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000

// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'police'], required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

// Case Schema
const caseSchema = new mongoose.Schema({
  caseId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, default: 'pending' },
  priority: { type: String, required: true },
  incidentDate: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  complainant: { type: String, required: true },
  complainantContact: { type: String, required: true },
  assignedOfficer: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Case = mongoose.model('Case', caseSchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    const user = await User.findOne({ username, role });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        email: user.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all cases
app.get('/api/cases', authenticateToken, async (req, res) => {
  try {
    const cases = await Case.find().sort({ createdAt: -1 });
    res.json({ success: true, cases });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new case
app.post('/api/cases', authenticateToken, async (req, res) => {
  try {
    const caseData = {
      ...req.body,
      caseId: generateCaseId(),
      createdBy: req.user.id
    };
    
    const newCase = new Case(caseData);
    await newCase.save();
    
    res.json({ success: true, case: newCase });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update case
app.put('/api/cases/:id', authenticateToken, async (req, res) => {
  try {
    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    res.json({ success: true, case: updatedCase });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete case
app.delete('/api/cases/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    await Case.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Case deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all users (admin only)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new user (admin only)
app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const { password, ...userData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      ...userData,
      password: hashedPassword
    });
    
    await newUser.save();
    
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    res.json({ success: true, user: userResponse });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'Username already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
});

// Helper function to generate case ID
function generateCaseId() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CASE${year}${random}`;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Create default admin user if it doesn't exist
async function createDefaultAdmin() {
  try {
    const adminExists = await User.findOne({ username: 'admin', role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        fullName: 'System Administrator',
        email: 'admin@crms.com'
      });
      await admin.save();
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

// Initialize default data
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB Atlas');
  createDefaultAdmin();
});
*/
