# 🎓 PAL Training System (PLS)

**Palestine Training System** - A comprehensive internship management platform designed to streamline the internship process for students, companies, supervisors, and training managers.

## 📋 Table of Contents

- [Overview](#overview)
- [System Objectives](#system-objectives)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Contributing](#contributing)
- [Documentation](#documentation)

## 🌟 Overview

The PAL Training System (PLS) is a modern web-based platform that connects students, training managers, companies, and supervisors to enhance the internship process and achieve training objectives. The system facilitates seamless interaction among all stakeholders through an integrated messaging system, real-time monitoring, and comprehensive management tools.

### 🎯 System Objectives

- **Simplify** the application and matching process for internships
- **Reduce** administrative effort for training managers
- **Improve** communication between all users (students, supervisors, and training managers)
- **Provide** real-time monitoring and feedback on student performance
- **Streamline** the entire internship lifecycle management

## ✨ Key Features

### 🔍 **Internship Discovery**
- Helps students identify internships that align with their skills and career objectives
- Comprehensive company information, locations, available courses, and positions
- Advanced search and filtering capabilities

### 📊 **Real-Time Tracking**
- Monitor student activities, attendance, and performance during internships
- Supervisor feedback integration
- Progress tracking and analytics

### 💬 **Streamlined Communication**
- Integrated messaging system between students, training managers, and supervisors
- Real-time notifications and alerts
- Role-based communication channels

### 📋 **Application Management**
- Companies can post internship opportunities
- Review and manage student applications (accept/reject)
- Application status tracking and notifications

### 📈 **Reports and Analytics**
- Comprehensive reporting system
- Student progress reports
- Performance analytics and insights
- Deadline management and alerts

## 👥 User Roles

### 🎓 **Students**
- **Profile Management**: Create and maintain personal profiles
- **Internship Search**: Browse and search available internships with filters
- **Application System**: Apply to up to 3 internships simultaneously
- **Progress Reporting**: Submit training progress reports
- **Communication**: Secure messaging with supervisors and training managers
- **Status Tracking**: Monitor application status and receive notifications

### 🏢 **Companies**
- **Internship Management**: Post and manage internship opportunities
- **Application Review**: View and process student applications
- **Supervisor Assignment**: Assign supervisors to internships
- **Performance Tracking**: Monitor and report student progress
- **Communication**: Direct messaging with students and training managers

### 👨‍🏫 **Supervisors**
- **Student Monitoring**: Track assigned students' progress and attendance
- **Absence Management**: Record and manage student absences
- **Report Evaluation**: Review and evaluate student reports
- **Communication**: Message students and training managers
- **Performance Assessment**: Provide feedback on student performance

### 🛠️ **Training Managers (Administrators)**
- **Account Management**: Approve/reject registrations, manage user accounts
- **Application Oversight**: Monitor and manage all internship applications
- **System Administration**: Manage report templates, deadlines, and system settings
- **Analytics**: Access comprehensive system analytics and reports
- **Communication**: Administrative messaging capabilities

## 🛠️ Technology Stack

### **Frontend**
- **React 18** with TypeScript
- **Create React App** for project structure
- **Bootstrap 5.3** for responsive design
- **React Router** for navigation
- **Axios** for HTTP requests
- **Chart.js** for data visualization
- **FontAwesome** for icons

### **Backend**
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MySQL** database with mysql2 driver
- **Multer** for file uploads
- **bcrypt** for password hashing
- **JSON Web Tokens** for authentication
- **CORS** for cross-origin requests

### **Development Tools**
- **Nodemon** for development server
- **Jest** for testing
- **React Testing Library** for component testing
- **ESLint** and **Prettier** for code quality
- **Git LFS** for large file management

## 🏗️ System Architecture

The PAL Training System follows a modern **3-tier architecture**:

### **Presentation Layer (Frontend)**
- React-based Single Page Application (SPA)
- Responsive Bootstrap components
- Role-based navigation and access control
- LocalStorage for session management

### **Business Logic Layer (Backend API)**
- Express.js RESTful API server
- JWT-based authentication
- Role-based authorization
- CRUD operations for all entities
- File upload and management

### **Data Layer (Database)**
- MySQL relational database
- Normalized schema with foreign key relationships
- Optimized queries and indexing
- Data integrity constraints

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **MySQL** (v8.0 or higher)
- **Git** with **Git LFS**
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/NoorZayed/PALTrainingSystem.git
cd PALTrainingSystem
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Backend Dependencies
```bash
cd backend
npm install
```

### 3. Database Setup
```bash
# Import the database schema
mysql -u root -p < "pal_db FINAL.sql"
```

### 4. Environment Configuration

Create a `.env` file in the backend directory:
```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=pal_db
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 5. Start the Application

#### Start Backend Server
```bash
cd backend
npm run dev
```

#### Start Frontend Development Server
```bash
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📖 Usage

### First Time Setup
1. **Admin Account**: Use the default admin credentials to access the system
2. **Company Registration**: Companies register and wait for admin approval
3. **Student Registration**: Students register and wait for admin approval
4. **Supervisor Assignment**: Companies assign supervisors to their internships

### Typical Workflow
1. **Student** searches and applies for internships (max 3 applications)
2. **Company** reviews applications and accepts/rejects candidates
3. **Supervisor** is assigned to monitor accepted students
4. **Student** submits progress reports throughout the internship
5. **Training Manager** monitors overall system performance and generates reports

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Student Endpoints
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student profile
- `POST /api/students/apply` - Apply for internship

### Company Endpoints
- `GET /api/companies` - Get all companies
- `POST /api/companies/internships` - Create internship
- `GET /api/companies/:id/applications` - Get applications

### Internship Endpoints
- `GET /api/internships` - Get all internships
- `GET /api/internships/search` - Search internships
- `POST /api/internships` - Create internship

*For complete API documentation, refer to the backend source code.*

## 🗄️ Database Schema

### Core Tables
- **users** - Central authentication table
- **students** - Student profiles and information
- **companies** - Company profiles and details
- **supervisors** - Supervisor information
- **training_managers** - Administrator accounts
- **internships** - Available internship postings
- **applications** - Student applications with status
- **reports** - Student progress reports
- **messages** - Communication system

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test
```

### Test Coverage
- **Authentication**: 85% coverage
- **Student Module**: 82% coverage
- **Company Module**: 78% coverage
- **Supervisor Module**: 75% coverage
- **Admin Module**: 80% coverage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 Documentation

Comprehensive documentation is available in the following files:
- **[SYSTEM_APPROACH.md](SYSTEM_APPROACH.md)** - Detailed system architecture and approach
- **[SYSTEM_MODEL_AND_ARCHITECTURE.md](SYSTEM_MODEL_AND_ARCHITECTURE.md)** - System model and requirements
- **[TOOLS_AND_TECHNOLOGY.md](TOOLS_AND_TECHNOLOGY.md)** - Technology stack details

## 📝 License

This project is part of an academic assignment and is not licensed for commercial use.

## 👨‍💻 Development Team

Developed as part of a comprehensive software engineering project focusing on internship management systems.

---

**Note**: This system uses Git LFS for managing large files (images, documents, etc.). Make sure you have Git LFS installed and configured before cloning the repository.
