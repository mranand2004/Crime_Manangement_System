# CRMS Backend Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

## Installation Steps

### 1. Clone and Setup Project

\`\`\`bash
# Create project directory
mkdir crms-backend
cd crms-backend

# Initialize npm project (if not already done)
npm init -y

# Install dependencies
npm install express mongoose cors bcryptjs jsonwebtoken dotenv helmet express-rate-limit express-validator morgan

# Install development dependencies
npm install --save-dev nodemon
\`\`\`

### 2. Environment Configuration

Create a `.env` file in the root directory:

\`\`\`env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/crms?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex_at_least_32_characters
JWT_EXPIRE=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
\`\`\`

### 3. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "Shared" (free tier)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password
   - Set user privileges to "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
   - For production, add specific IP addresses

5. **Get Connection String**
   - Go to "Databases" and click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `crms`

### 4. Project Structure

Ensure your project has this structure:

\`\`\`
crms-backend/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── caseController.js
│   ├── userController.js
│   └── dashboardController.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validation.js
├── models/
│   ├── User.js
│   └── Case.js
├── routes/
│   ├── auth.js
│   ├── cases.js
│   ├── users.js
│   └── dashboard.js
├── .env
├── .env.example
├── package.json
├── server.js
└── SETUP.md
\`\`\`

### 5. Update Package.json Scripts

Add these scripts to your `package.json`:

\`\`\`json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
\`\`\`

### 6. Start the Server

\`\`\`bash
# For development (with auto-restart)
npm run dev

# For production
npm start
\`\`\`

### 7. Test the API

The server should start on `http://localhost:3000`. You can test the health endpoint:

\`\`\`bash
curl http://localhost:3000/health
\`\`\`

Expected response:
\`\`\`json
{
  "status": "OK",
  "message": "CRMS API is running",
  "timestamp": "2025-01-XX...",
  "environment": "development"
}
\`\`\`

### 8. Default Users

The system automatically creates default users on first run:

| Username | Password   | Role   | Full Name            |
|----------|------------|--------|---------------------|
| admin    | admin123   | admin  | System Administrator |
| officer1 | police123  | police | John Smith          |
| officer2 | police123  | police | Jane Doe            |

### 9. API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

#### Cases
- `GET /api/cases` - Get all cases (with pagination and filters)
- `POST /api/cases` - Create new case
- `GET /api/cases/:id` - Get single case
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case (Admin only)
- `POST /api/cases/:id/notes` - Add note to case
- `GET /api/cases/stats` - Get case statistics

#### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `GET /api/users/:id` - Get single user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/officers` - Get active officers
- `PUT /api/users/:id/reset-password` - Reset user password (Admin only)

#### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/officer-performance` - Get officer performance (Admin only)

### 10. Frontend Integration

Update your frontend `script.js` file:

\`\`\`javascript
// Replace the API_BASE_URL
const API_BASE_URL = "http://localhost:3000/api"

// Update the fetchCases function to use real API
async function fetchCases() {
  try {
    const token = localStorage.getItem('crms_token');
    const response = await fetch(`${API_BASE_URL}/cases`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch cases');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching cases:', error);
    return [];
  }
}

// Update login function
async function mockLogin(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    const result = await response.json();
    
    if (result.success) {
      localStorage.setItem('crms_token', result.token);
      return {
        success: true,
        user: result.user
      };
    } else {
      return {
        success: false,
        message: result.message
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Network error'
    };
  }
}
\`\`\`

### 11. Security Considerations

For production deployment:

1. **Environment Variables**: Never commit `.env` file to version control
2. **JWT Secret**: Use a strong, random secret key (at least 32 characters)
3. **CORS**: Configure specific origins instead of allowing all
4. **Rate Limiting**: Adjust limits based on your needs
5. **HTTPS**: Always use HTTPS in production
6. **Database Security**: Use specific IP addresses for network access
7. **Input Validation**: All inputs are validated using express-validator
8. **Password Security**: Passwords are hashed using bcrypt with salt rounds of 12

### 12. Troubleshooting

#### Common Issues:

1. **MongoDB Connection Error**
   - Check your connection string
   - Verify database user credentials
   - Ensure network access is configured

2. **Port Already in Use**
   - Change the PORT in `.env` file
   - Kill the process using the port: `lsof -ti:3000 | xargs kill -9`

3. **JWT Token Issues**
   - Ensure JWT_SECRET is set in `.env`
   - Check token expiration time

4. **CORS Issues**
   - Verify FRONTEND_URL in `.env`
   - Check CORS configuration in server.js

### 13. Development Tips

1. **Use Nodemon**: Automatically restarts server on file changes
2. **MongoDB Compass**: GUI tool for viewing database data
3. **Postman**: Test API endpoints
4. **VS Code Extensions**: 
   - REST Client
   - MongoDB for VS Code
   - Thunder Client

### 14. Production Deployment

For production deployment on platforms like Heroku, Vercel, or DigitalOcean:

1. Set environment variables in your hosting platform
2. Update CORS settings for your production domain
3. Use a process manager like PM2
4. Set up proper logging
5. Configure SSL/TLS certificates
6. Set up monitoring and alerts

This completes the backend setup for your Crime Records Management System!
