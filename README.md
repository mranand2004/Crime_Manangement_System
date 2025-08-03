# Crime Records Management System (CRMS)

A comprehensive web-based Crime Records Management System built with HTML, CSS, JavaScript, and MongoDB Atlas.

## Features

### Authentication & Authorization
- Role-based access control (Admin and Police Officer)
- Secure login system
- Session management with localStorage

### Dashboard
- Real-time statistics overview
- Case status tracking (Pending, Active, Solved, Closed)
- Recent cases display
- Priority-based case management

### Case Management
- Add new criminal cases
- View all cases with search and filter functionality
- Edit and update case details
- Case status management
- Priority levels (Low, Medium, High, Critical)
- Case types (Theft, Assault, Fraud, Vandalism, Drug Related, Domestic Violence, Other)

### User Management (Admin Only)
- Add new users (Admin/Police Officers)
- View all system users
- User role management
- User status control

### Reports & Analytics (Admin Only)
- Case statistics by type
- Case statistics by status
- Date range filtering
- Visual charts and graphs
- Monthly trend analysis
- Officer performance tracking

### Responsive Design
- Mobile-friendly interface
- Adaptive layout for different screen sizes
- Touch-friendly controls

## Technology Stack

### Frontend
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox and Grid
- **JavaScript (ES6+)**: Interactive functionality and API integration
- **Chart.js**: Data visualization and analytics
- **Font Awesome**: Icons and visual elements

### Backend (Example provided)
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **MongoDB Atlas**: Cloud database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing

## Setup Instructions

### Frontend Setup
1. Clone or download the project files
2. Open `index.html` in a web browser
3. Use the default login credentials:
   - **Admin**: username: `admin`, password: `admin123`, role: `admin`
   - **Police Officer**: username: `officer1`, password: `police123`, role: `police`

### Backend Setup (Optional)
1. Create a new Node.js project
2. Install dependencies:
   \`\`\`bash
   npm install express mongoose cors bcryptjs jsonwebtoken dotenv
   \`\`\`
3. Create a `.env` file with your MongoDB Atlas connection string:
   \`\`\`
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   \`\`\`
4. Use the provided `api-backend-example.js` as your server file
5. Run the server:
   \`\`\`bash
   node server.js
   \`\`\`

### MongoDB Atlas Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Replace the connection string in your backend configuration

## File Structure

\`\`\`
crime-records-system/
├── index.html              # Main HTML file
├── styles.css              # CSS styles
├── script.js               # Frontend JavaScript
├── api-backend-example.js  # Backend API example
└── README.md              # Documentation
\`\`\`

## Default Users

The system comes with pre-configured demo users:

| Username | Password   | Role   | Full Name            |
|----------|------------|--------|---------------------|
| admin    | admin123   | admin  | System Administrator |
| officer1 | police123  | police | John Smith          |
| officer2 | police123  | police | Jane Doe            |

## Features by Role

### Admin Features
- Full access to all system features
- User management (add, edit, delete users)
- Advanced reports and analytics
- System configuration
- Case management oversight

### Police Officer Features
- Case management (add, view, edit cases)
- Dashboard overview
- Basic reporting
- Profile management

## API Endpoints (Backend)

### Authentication
- `POST /api/login` - User login

### Cases
- `GET /api/cases` - Get all cases
- `POST /api/cases` - Create new case
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case (Admin only)

### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create new user (Admin only)

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- CORS protection
- Secure session management

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the project repository.
