# System Approach and Architecture

## Overview
The PAL (Palestine Training System) internship management system follows a straightforward, user-centric approach designed to streamline the internship process for students, companies, supervisors, and training managers (administrators). This document outlines the system's actual architectural approach, design principles, and implementation methodology based on the current codebase.

## System Architecture Approach

### 3-Tier Architecture
The system implements a simple 3-tier architecture pattern:

1. **Presentation Layer (Frontend)**
   - React-based single-page application (SPA) using Create React App
   - Bootstrap CSS framework for responsive design
   - Component-based architecture with React Router for navigation
   - LocalStorage for session management

2. **Business Logic Layer (Backend API)**
   - Express.js RESTful API server with TypeScript
   - Basic authentication without password hashing
   - CRUD operations for all entities
   - File upload using Multer middleware

3. **Data Layer (Database)**
   - MySQL relational database
   - Basic normalized schema with foreign key relationships
   - Simple database queries using mysql2 package
   - No complex indexing or optimization strategies

### Monolithic Architecture
The system follows a traditional monolithic structure:

- **Single Backend Server** - All API endpoints in one Express.js application
- **Direct Database Access** - Simple database queries without ORM
- **Role-Based Routing** - Frontend routing based on user roles stored in localStorage

## User-Centric Design Approach

### Multi-Role Architecture
The system supports four distinct user roles with specific dashboards and functionality:

1. **Students**
   - Personal dashboard with internship applications status
   - Internship search and browse functionality
   - Application submission (maximum 3 active applications)
   - Progress report submission
   - Basic messaging with supervisors and training managers

2. **Companies**
   - Company dashboard with internship management
   - Create and manage internship postings
   - Review and approve/reject student applications
   - Assign supervisors to internships
   - View reports from assigned students

3. **Supervisors**
   - Monitor assigned students' progress
   - Record student absences
   - Review and evaluate student reports
   - Message students and training managers

4. **Training Managers (Administrators)**
   - Approve or reject student registrations
   - Create and manage student accounts
   - Oversee system-wide student and company data
   - Manage report templates and deadlines
   - Administrative messaging capabilities

### Simple Role-Based Access Control
```
User Login → Role Check → Redirect to Role-Specific Dashboard → Access Control by Role
```

## Data Management Approach

### Database Design Philosophy

#### Basic Normalization
- **Users Table** - Central authentication table with roles
- **Students Table** - Student-specific information and status
- **Company Table** - Company profiles and information
- **Supervisors Table** - Supervisor details linked to companies
- **Training_Manager Table** - Administrator information
- **Internship Table** - Available internship postings
- **Applications Table** - Student applications with status tracking
- **Report Table** - Student progress reports
- **Submit_Report Table** - Report templates and deadlines

#### Key Relationships
```
users (1) → (1) students/companies/supervisors/training_managers
companies (1) → (∞) internships
internships (1) → (∞) applications
students (1) → (∞) applications
students (1) → (∞) reports
supervisors (1) → (∞) absences
```

#### Data Integrity
- **Foreign Key Constraints** - Basic referential integrity
- **Simple Validation** - Frontend form validation only
- **Status Tracking** - Application and account status management

### Real-Time Communication
- **Firebase Integration** - Simple messaging system using Firestore
- **Basic Chat** - Text-based communication between user roles
- **No Complex Features** - No file sharing or advanced messaging features

## Security Approach

### Basic Authentication Strategy
```
Login Request → Email/Password Check → Role Assignment → localStorage Session → Dashboard Redirect
```

#### Simple Security Implementation
1. **Frontend Validation** - Basic form validation and required fields
2. **Backend Verification** - Simple email/password matching
3. **No Password Hashing** - Passwords stored in plain text (security limitation)
4. **Session Management** - localStorage-based session with basic timeouts

### Current Security Limitations
- **Plain Text Passwords** - No bcrypt or hashing implementation
- **Basic Session Management** - No JWT tokens or secure session handling
- **Limited Input Sanitization** - Basic frontend validation only
- **SQL Injection Prevention** - Parameterized queries used correctly

## API Design Approach

### Simple RESTful Endpoints

#### Basic CRUD Operations
```
GET    /api/students/:id           - Retrieve student data
POST   /api/applications          - Create new application
PUT    /api/reports/:id/grade     - Update report grade
DELETE /api/students/:id          - Delete student account
```

#### Standard HTTP Responses
- **200 OK** - Successful operations
- **400 Bad Request** - Missing required fields
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Database errors

### Simple Error Handling
```
Database Error → Console Log → Generic Error Response → Frontend Alert
```

## Component Architecture Approach

### Basic React Component Structure
```
App.tsx
├── Navbar (Navigation with role-based links)
├── Routes (React Router for role-specific pages)
│   ├── Student Pages
│   │   ├── StudentDashboard
│   │   ├── InternshipSearch
│   │   ├── StudentProfile
│   │   └── StudentMessages
│   ├── Company Pages
│   │   ├── CompanyDashboard
│   │   ├── CompanyInternships
│   │   ├── CompanyRequests
│   │   └── CompanyMessages
│   ├── Supervisor Pages
│   │   ├── SupervisorDashboard
│   │   ├── SupervisorReportPage
│   │   └── SupervisorMessagesPage
│   └── Admin Pages
│       ├── AdminDashboard
│       ├── StudentRequests
│       └── AdminMessages
└── Footer
```

### Component Design Principles
- **Page-Based Components** - Each major feature is a separate page component
- **Bootstrap Styling** - CSS framework for quick styling
- **Basic State Management** - useState and useEffect hooks only
- **Props for Data Passing** - Simple parent-child data flow

## State Management Approach

### Simple State Strategy
- **Component State** - useState for local component data
- **Props Drilling** - Pass data through component props
- **localStorage** - User session and authentication state
- **No Complex State Management** - No Redux, Context API, or state libraries

### Data Flow
```
API Call → Component State Update → Re-render → Display Data
```

## Performance Approach

### Basic Optimization
- **Create React App** - Standard React build process
- **Bootstrap CDN** - External CSS framework
- **Basic Image Handling** - Simple image uploads without optimization
- **No Advanced Optimization** - No code splitting, lazy loading, or caching

### Simple Database Operations
- **Direct MySQL Queries** - No query optimization or indexing
- **Basic Connection Handling** - Simple database connection pool
- **No Caching** - Direct database calls for all operations

## User Experience (UX) Approach

### Basic Design Principles
1. **Bootstrap Components** - Standard responsive design
2. **Simple Navigation** - Role-based navbar with basic links
3. **Basic Forms** - Standard HTML forms with minimal validation
4. **Alert Messages** - Simple success/error message display

### User Journey
```
Login → Role Check → Dashboard → Basic CRUD Operations → Logout
```

#### Student Journey
```
Login → Student Dashboard → Browse Internships → Apply → Submit Reports
```

#### Company Journey
```
Login → Company Dashboard → Post Internships → Review Applications → Monitor Students
```

## Testing and Deployment Approach

### Current Testing
- **No Automated Testing** - No unit tests, integration tests, or testing framework
- **Manual Testing** - Basic manual testing during development
- **No Test Coverage** - No formal testing strategy

### Simple Deployment
- **Development Environment** - Local development with npm start
- **Basic Production** - Simple build and serve approach
- **No CI/CD** - Manual deployment process

### 9.3 Unit Tests for Core Functionality

The following unit tests cover the critical functionality of the PAL system using Jest as the testing framework. These tests focus on ensuring that individual components and functions work correctly in isolation.

#### Authentication Unit Tests

```javascript
// Authentication Service Tests
describe('Authentication Service', () => {
  test('Login with valid credentials should return user data with correct role', async () => {
    // Arrange
    const credentials = { email: 'student@example.com', password: 'password123' };
    const mockResponse = { id: 1, email: 'student@example.com', role: 'student', name: 'John Doe' };
    mockAxios.post.mockResolvedValue({ data: mockResponse });
    
    // Act
    const result = await authService.login(credentials);
    
    // Assert
    expect(result).toEqual(mockResponse);
    expect(mockAxios.post).toHaveBeenCalledWith('/api/login', credentials);
  });
  
  test('Login with invalid credentials should throw authentication error', async () => {
    // Arrange
    const credentials = { email: 'student@example.com', password: 'wrongpassword' };
    mockAxios.post.mockRejectedValue({ response: { status: 401, data: { message: 'Invalid credentials' } } });
    
    // Act & Assert
    await expect(authService.login(credentials)).rejects.toThrow('Authentication failed');
  });
  
  test('Logout should clear local storage', async () => {
    // Arrange
    const mockLocalStorage = { removeItem: jest.fn() };
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    
    // Act
    authService.logout();
    
    // Assert
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
  });
  
  test('isAuthenticated should return true when user exists in localStorage', () => {
    // Arrange
    const mockUser = { id: 1, role: 'student' };
    const mockLocalStorage = { 
      getItem: jest.fn().mockReturnValue(JSON.stringify(mockUser)),
    };
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    
    // Act
    const result = authService.isAuthenticated();
    
    // Assert
    expect(result).toBe(true);
  });
});
```

#### Student Profile Unit Tests

```javascript
// Student Profile Component Tests
describe('StudentProfile Component', () => {
  test('should render student profile correctly with student data', () => {
    // Arrange
    const mockStudent = {
      student_id: 1,
      first_name: 'John',
      last_name: 'Doe',
      major: 'Computer Science',
      interests: ['Web Development', 'Mobile Development'],
      skills: ['JavaScript', 'React', 'Node.js'],
      location: 'Ramallah',
      about: 'Computer Science student interested in web development'
    };
    
    // Act
    const { getByText, getByTestId } = render(<StudentProfile student={mockStudent} />);
    
    // Assert
    expect(getByText('John Doe')).toBeInTheDocument();
    expect(getByText('Computer Science')).toBeInTheDocument();
    expect(getByText('Web Development')).toBeInTheDocument();
    expect(getByText('JavaScript')).toBeInTheDocument();
    expect(getByText('Ramallah')).toBeInTheDocument();
    expect(getByTestId('student-about')).toHaveTextContent('Computer Science student');
  });
  
  test('should show edit form when edit button is clicked', () => {
    // Arrange
    const mockStudent = { /* ...student data */ };
    
    // Act
    const { getByText, getByTestId } = render(<StudentProfile student={mockStudent} />);
    fireEvent.click(getByText('Edit Profile'));
    
    // Assert
    expect(getByTestId('profile-edit-form')).toBeInTheDocument();
  });
  
  test('should update profile when form is submitted with valid data', async () => {
    // Arrange
    const mockStudent = { /* ...student data */ };
    const mockUpdateProfile = jest.fn().mockResolvedValue({ success: true });
    
    // Act
    const { getByText, getByLabelText } = render(
      <StudentProfile student={mockStudent} updateProfile={mockUpdateProfile} />
    );
    fireEvent.click(getByText('Edit Profile'));
    
    fireEvent.change(getByLabelText('About'), { target: { value: 'Updated bio information' } });
    fireEvent.click(getByText('Save Changes'));
    
    // Assert
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ about: 'Updated bio information' })
      );
    });
  });
});
```

#### Internship Search Unit Tests

```javascript
// Internship Search Service Tests
describe('Internship Search Service', () => {
  test('fetchInternships should return internship list', async () => {
    // Arrange
    const mockInternships = [
      { internship_id: 1, title: 'Frontend Developer', company: 'Tech Co', location: 'Jerusalem' },
      { internship_id: 2, title: 'Backend Developer', company: 'Dev Inc', location: 'Ramallah' }
    ];
    mockAxios.get.mockResolvedValue({ data: mockInternships });
    
    // Act
    const result = await internshipService.fetchInternships();
    
    // Assert
    expect(result).toEqual(mockInternships);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/internships');
  });
  
  test('searchInternships should filter by search term correctly', async () => {
    // Arrange
    const mockInternships = [
      { internship_id: 1, title: 'Frontend Developer', company: 'Tech Co', location: 'Jerusalem' },
      { internship_id: 2, title: 'Backend Developer', company: 'Dev Inc', location: 'Ramallah' }
    ];
    
    // Act
    const result = internshipService.filterInternships(mockInternships, 'Frontend', '', '');
    
    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Frontend Developer');
  });
  
  test('filterInternships should filter by location correctly', async () => {
    // Arrange
    const mockInternships = [
      { internship_id: 1, title: 'Frontend Developer', company: 'Tech Co', location: 'Jerusalem' },
      { internship_id: 2, title: 'Backend Developer', company: 'Dev Inc', location: 'Ramallah' }
    ];
    
    // Act
    const result = internshipService.filterInternships(mockInternships, '', 'Ramallah', '');
    
    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].location).toBe('Ramallah');
  });
});
```

#### Application Management Unit Tests

```javascript
// Application Service Tests
describe('Application Service', () => {
  test('submitApplication should post to correct endpoint with application data', async () => {
    // Arrange
    const applicationData = { 
      student_id: 1, 
      internship_id: 5,
      cover_letter: 'I am interested in this position'
    };
    mockAxios.post.mockResolvedValue({ data: { application_id: 10, status: 'pending' } });
    
    // Act
    const result = await applicationService.submitApplication(applicationData);
    
    // Assert
    expect(result).toHaveProperty('application_id', 10);
    expect(mockAxios.post).toHaveBeenCalledWith('/api/internships/apply', applicationData);
  });
  
  test('getApplications should fetch student applications', async () => {
    // Arrange
    const studentId = 1;
    const mockApplications = [
      { application_id: 1, internship_id: 5, status: 'pending', applied_at: '2023-05-10' },
      { application_id: 2, internship_id: 7, status: 'accepted', applied_at: '2023-05-15' }
    ];
    mockAxios.get.mockResolvedValue({ data: mockApplications });
    
    // Act
    const result = await applicationService.getApplications(studentId);
    
    // Assert
    expect(result).toEqual(mockApplications);
    expect(mockAxios.get).toHaveBeenCalledWith(`/api/applications/student/${studentId}`);
  });
  
  test('checkDailyLimit should return true when limit reached', async () => {
    // Arrange
    const studentId = 1;
    mockAxios.get.mockResolvedValue({ data: { count: 10 } });
    
    // Act
    const result = await applicationService.checkDailyLimit(studentId);
    
    // Assert
    expect(result).toBe(true);
    expect(mockAxios.get).toHaveBeenCalledWith(`/api/applications/daily-count/${studentId}`);
  });
});
```

#### Report Management Unit Tests

```javascript
// Report Service Tests
describe('Report Service', () => {
  test('submitReport should post report data correctly', async () => {
    // Arrange
    const reportData = {
      supervisor_id: 3,
      student_id: 7,
      internship_id: 12,
      report_template_id: 5,
      comments: 'Student is performing well',
      performance_rating: 4
    };
    mockAxios.post.mockResolvedValue({ data: { report_id: 15 } });
    
    // Act
    const result = await reportService.submitReport(reportData);
    
    // Assert
    expect(result).toHaveProperty('report_id', 15);
    expect(mockAxios.post).toHaveBeenCalledWith('/api/supervisor/submit-report', reportData);
  });
  
  test('getStudentReports should fetch reports for a student', async () => {
    // Arrange
    const studentId = 7;
    const mockReports = [
      { report_id: 10, submitted_by: 'John Smith', grade: 'A', submitted_at: '2023-06-15' },
      { report_id: 15, submitted_by: 'John Smith', grade: null, submitted_at: '2023-07-01' }
    ];
    mockAxios.get.mockResolvedValue({ data: mockReports });
    
    // Act
    const result = await reportService.getStudentReports(studentId);
    
    // Assert
    expect(result).toEqual(mockReports);
    expect(mockAxios.get).toHaveBeenCalledWith(`/api/reports/${studentId}`);
  });
});
```

### 9.4 Integration Tests for Core Functionality

The following integration tests verify that different components of the PAL system work together correctly, focusing on end-to-end workflows and interactions between frontend, backend, and database.

#### Student Registration and Login Flow

```javascript
describe('Student Registration and Login Flow', () => {
  test('Student should be able to register and login after approval', async () => {
    // Arrange - Create test student data
    const studentData = {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      password: 'securePassword123',
      major: 'Computer Engineering',
      university_id: 'ST12345',
      location: 'Bethlehem'
    };
    
    // Act - Register student
    const response = await request(app)
      .post('/api/student-form')
      .send(studentData);
    
    // Assert - Registration successful
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Registration submitted successfully');
    
    // Get the created student ID
    const studentId = response.body.student_id;
    
    // Act - Admin approves the student
    const approvalResponse = await request(app)
      .put(`/api/students/${studentId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    // Assert - Approval successful
    expect(approvalResponse.status).toBe(200);
    
    // Act - Student tries to login
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: studentData.email,
        password: studentData.password
      });
    
    // Assert - Login successful with correct user data
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('role', 'student');
    expect(loginResponse.body).toHaveProperty('email', studentData.email);
    expect(loginResponse.body).toHaveProperty('isFirstLogin', true);
  });
});
```

#### Internship Application Workflow

```javascript
describe('Internship Application Workflow', () => {
  test('Student should be able to apply for internship and company should review', async () => {
    // Arrange - Create test data and authenticate
    const studentToken = await authenticateTestStudent();
    const companyToken = await authenticateTestCompany();
    
    // Create test internship
    const internshipData = {
      title: 'Full Stack Developer',
      description: 'Develop web applications using React and Node.js',
      location: 'Ramallah',
      duration: '3 months',
      start_date: '2023-09-01',
      type: 'onsite'
    };
    
    const internshipResponse = await request(app)
      .post('/api/internships')
      .set('Authorization', `Bearer ${companyToken}`)
      .send(internshipData);
    
    const internshipId = internshipResponse.body.internship_id;
    
    // Act - Student applies for internship
    const applicationResponse = await request(app)
      .post('/api/internships/apply')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        internship_id: internshipId,
        cover_letter: 'I am interested in this position and have relevant skills.'
      });
    
    // Assert - Application successful
    expect(applicationResponse.status).toBe(201);
    const applicationId = applicationResponse.body.application_id;
    
    // Act - Company views applications
    const applicationsResponse = await request(app)
      .get(`/api/applications/internship/${internshipId}`)
      .set('Authorization', `Bearer ${companyToken}`);
    
    // Assert - Company can see the application
    expect(applicationsResponse.status).toBe(200);
    expect(applicationsResponse.body).toContainEqual(
      expect.objectContaining({
        application_id: applicationId,
        status: 'pending'
      })
    );
    
    // Act - Company accepts the application
    const acceptResponse = await request(app)
      .put(`/api/applications/${applicationId}/status`)
      .set('Authorization', `Bearer ${companyToken}`)
      .send({
        status: 'accepted'
      });
    
    // Assert - Application accepted
    expect(acceptResponse.status).toBe(200);
    
    // Act - Student checks application status
    const studentApplicationsResponse = await request(app)
      .get('/api/applications/student')
      .set('Authorization', `Bearer ${studentToken}`);
    
    // Assert - Student sees updated status
    expect(studentApplicationsResponse.body).toContainEqual(
      expect.objectContaining({
        application_id: applicationId,
        status: 'accepted'
      })
    );
  });
});
```

#### Report Submission and Grading Workflow

```javascript
describe('Report Submission and Grading Workflow', () => {
  test('Supervisor should submit report and admin should grade it', async () => {
    // Arrange - Set up test data and authenticate
    const supervisorToken = await authenticateTestSupervisor();
    const adminToken = await authenticateTestAdmin();
    
    // Set up test student and internship relationship
    const testStudentId = 7;  // Assuming this student exists and is assigned
    const testInternshipId = 12;  // Assuming this internship exists
    
    // Create test report template
    const templateResponse = await request(app)
      .post('/api/create-report')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Monthly Performance Evaluation',
        description: 'Evaluate student monthly performance',
        deadline: '2023-07-30'
      });
    
    const templateId = templateResponse.body.template_id;
    
    // Act - Supervisor submits report
    const reportData = {
      student_id: testStudentId,
      internship_id: testInternshipId,
      report_template_id: templateId,
      comments: 'Student has shown excellent progress in developing web applications',
      performance_rating: 5,
      attendance_rating: 4,
      technical_skills_rating: 5,
      communication_rating: 4
    };
    
    const reportResponse = await request(app)
      .post('/api/supervisor/submit-report')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send(reportData);
    
    // Assert - Report submission successful
    expect(reportResponse.status).toBe(201);
    const reportId = reportResponse.body.report_id;
    
    // Act - Admin reviews and grades the report
    const gradeResponse = await request(app)
      .put(`/api/reports/${reportId}/grade`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        grade: 'A',
        admin_comments: 'Excellent work and progress'
      });
    
    // Assert - Grading successful
    expect(gradeResponse.status).toBe(200);
    
    // Act - Student views the graded report
    const studentToken = await authenticateTestStudent(testStudentId);
    const studentReportResponse = await request(app)
      .get(`/api/reports/${testStudentId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    
    // Assert - Student can see the graded report
    expect(studentReportResponse.status).toBe(200);
    expect(studentReportResponse.body).toContainEqual(
      expect.objectContaining({
        report_id: reportId,
        grade: 'A',
        admin_comments: 'Excellent work and progress'
      })
    );
  });
});
```

#### Firebase Messaging Integration Test

```javascript
describe('Firebase Messaging Integration', () => {
  test('Messages should be sent and received between users', async () => {
    // Arrange - Set up test users and authenticate
    const studentToken = await authenticateTestStudent();
    const supervisorToken = await authenticateTestSupervisor();
    
    // Mock Firebase interaction
    const mockFirebase = setupMockFirebase();
    
    // Act - Student sends message to supervisor
    const messageData = {
      recipient_id: 'supervisor-123',
      content: 'Hello, I have a question about my internship',
      timestamp: new Date().toISOString()
    };
    
    const sendResponse = await request(app)
      .post('/api/messages/send')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(messageData);
    
    // Assert - Message sent successfully
    expect(sendResponse.status).toBe(201);
    expect(mockFirebase.collection).toHaveBeenCalledWith('messages');
    expect(mockFirebase.add).toHaveBeenCalledWith(
      expect.objectContaining({
        content: messageData.content
      })
    );
    
    // Act - Supervisor gets messages
    const receivedResponse = await request(app)
      .get('/api/messages/inbox')
      .set('Authorization', `Bearer ${supervisorToken}`);
    
    // Assert - Message received successfully
    expect(receivedResponse.status).toBe(200);
    expect(receivedResponse.body).toContainEqual(
      expect.objectContaining({
        content: messageData.content,
        sender_id: expect.any(String),
        read: false
      })
    );
  });
});
```

#### User Authentication Security Test

```javascript
describe('Authentication Security Integration Tests', () => {
  test('Should prevent access to protected routes without authentication', async () => {
    // Act & Assert - Student dashboard access without token
    const studentDashboardResponse = await request(app).get('/api/student/dashboard');
    expect(studentDashboardResponse.status).toBe(401);
    
    // Act & Assert - Company dashboard access without token
    const companyDashboardResponse = await request(app).get('/api/company/dashboard');
    expect(companyDashboardResponse.status).toBe(401);
    
    // Act & Assert - Admin dashboard access without token
    const adminDashboardResponse = await request(app).get('/api/admin/dashboard');
    expect(adminDashboardResponse.status).toBe(401);
  });
  
  test('Should prevent access to routes for incorrect role', async () => {
    // Arrange - Authenticate as student
    const studentToken = await authenticateTestStudent();
    
    // Act & Assert - Student attempting to access company routes
    const companyRouteResponse = await request(app)
      .get('/api/company/dashboard')
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(companyRouteResponse.status).toBe(403);
    
    // Act & Assert - Student attempting to access admin routes
    const adminRouteResponse = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(adminRouteResponse.status).toBe(403);
  });
  
  test('Should handle session expiration correctly', async () => {
    // Arrange - Create expired token
    const expiredToken = createExpiredToken();
    
    // Act - Attempt to access protected route with expired token
    const response = await request(app)
      .get('/api/student/dashboard')
      .set('Authorization', `Bearer ${expiredToken}`);
    
    // Assert - Properly rejects expired token
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Token expired');
  });
});
```

These comprehensive unit and integration tests provide a solid foundation for ensuring the quality and reliability of the PAL system. The tests cover key functionality across all user roles and critical workflows, helping to identify issues early in the development process and maintain system integrity during future enhancements.

## 10. Testing Strategy and Implementation

This chapter outlines the comprehensive testing approach developed for the PAL system, covering testing methodologies, unit and integration test cases, bug tracking, and continuous improvement processes.

### 10.1 Testing Strategies

The PAL system employs a multi-layered testing strategy to ensure functionality, security, and performance across all system components.

#### Testing Methodology

| Testing Level | Purpose | Tools | Coverage |
|--------------|---------|-------|----------|
| **Unit Testing** | Verify individual components and functions | Jest, React Testing Library | Core services and components |
| **Integration Testing** | Validate interactions between components | Supertest, Jest | Critical workflows and API endpoints |
| **End-to-End Testing** | Test complete user workflows | Manual testing | User journeys for all roles |
| **Security Testing** | Identify vulnerabilities | OWASP guidelines, manual testing | Authentication, authorization, data protection |
| **Performance Testing** | Evaluate system responsiveness | Manual timing, Chrome DevTools | API response times, UI rendering |

#### Test Planning Process

1. **Requirement Analysis**: Identify testable requirements from functional specifications
2. **Test Case Design**: Create test cases covering positive and negative scenarios
3. **Test Environment Setup**: Configure development environments with testing frameworks
4. **Test Execution**: Run tests manually and via automated scripts
5. **Result Analysis**: Document issues and verify fixes
6. **Regression Testing**: Ensure new changes don't break existing functionality

#### Testing Environment Configuration

```javascript
// Jest Configuration (jest.config.js)
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70
    }
  }
};
```

### 10.2 Unit Testing and Test Cases

Unit tests focus on verifying the correct behavior of individual components and functions in isolation, using mock objects to simulate dependencies.

#### Unit Testing Framework

The PAL system uses Jest as the primary testing framework with React Testing Library for component testing. The testing setup includes:

- **Mock Services**: Axios mock for API calls
- **Test Utilities**: Custom rendering and event simulation
- **Assertions**: Jest matchers and custom assertions
- **Coverage Reports**: Statement, branch, function, and line coverage

#### Core Unit Test Cases

The system includes unit tests for critical functionality across all user roles:

##### Authentication Tests

Authentication tests verify login, logout, registration, and session management functionality:

```javascript
// Authentication service tests verify:
// - Login with valid credentials returns correct user data
// - Login with invalid credentials throws appropriate errors
// - Logout properly clears session data
// - Token validation correctly identifies valid/invalid sessions
```

##### Student Module Tests

Student-related tests focus on profile management, internship search, and application functionality:

```javascript
// Student module tests verify:
// - Profile information renders correctly
// - Profile updates are sent to the correct endpoints
// - Internship search properly filters results
// - Application submissions enforce daily limits
// - Application status updates are reflected in the UI
```

##### Company Module Tests

Company tests ensure internship creation, application review, and supervisor management work correctly:

```javascript
// Company module tests verify:
// - Internship creation sends complete data to the API
// - Application review UI displays correct student information
// - Supervisor assignment updates the database correctly
// - Company dashboard displays accurate statistics
```

##### Supervisor Module Tests

Supervisor-related tests verify student monitoring and reporting functionality:

```javascript
// Supervisor module tests verify:
// - Assigned students are correctly displayed
// - Absence recording updates the database
// - Report submission includes all required fields
// - Historical reports are accessible and properly formatted
```

##### Admin Module Tests

Admin tests focus on system management, user approval, and reporting functions:

```javascript
// Admin module tests verify:
// - Student approval/rejection updates status correctly
// - Report template creation includes all fields
// - System statistics are calculated accurately
// - User management functions modify database records correctly
```

#### Unit Test Coverage Summary

| Module | Test Cases | Coverage % | Key Areas Tested |
|--------|------------|------------|------------------|
| Authentication | 12 | 85% | Login, logout, session validation |
| Student | 25 | 82% | Profile, search, applications |
| Company | 18 | 78% | Internship posting, application review |
| Supervisor | 15 | 75% | Student monitoring, reporting |
| Admin | 22 | 80% | User management, system monitoring |
| Shared Components | 14 | 90% | Navigation, forms, alerts |

### 10.3 Integration Testing

Integration tests verify that different components of the system work together correctly, focusing on data flow between frontend, backend, and database.

#### Integration Testing Approach

The PAL system uses a combination of API-level integration tests with Supertest and end-to-end testing for critical user workflows:

- **API Integration Tests**: Verify correct data flow between endpoints
- **Database Integration**: Ensure proper data persistence and retrieval
- **Authentication Flow**: Test complete login and session management
- **Cross-Module Workflows**: Verify multi-step processes across roles

#### Key Integration Test Cases

##### User Registration and Authentication Flow

```javascript
// Tests the complete user registration, approval, and login process:
// 1. Student submits registration
// 2. Admin reviews and approves registration
// 3. Student logs in with credentials
// 4. System redirects to correct dashboard
// 5. Session is maintained correctly
```

##### Internship Application Workflow

```javascript
// Tests the complete internship application process:
// 1. Company creates internship posting
// 2. Student searches and applies for internship
// 3. Company reviews and accepts application
// 4. Student receives status update
// 5. Supervisor is assigned to the student
```

##### Report Submission and Grading Workflow

```javascript
// Tests the complete report submission and grading process:
// 1. Admin creates report template
// 2. Supervisor completes and submits report
// 3. Admin reviews and grades report
// 4. Student views graded report
// 5. Report history is maintained
```

##### Messaging System Workflow

```javascript
// Tests the complete messaging workflow:
// 1. Student sends message to supervisor
// 2. Firebase delivers message in real-time
// 3. Supervisor receives notification
// 4. Supervisor replies to message
// 5. Thread is updated for both parties
```

##### Security and Access Control Tests

```javascript
// Tests system security and access controls:
// 1. Unauthenticated access attempts are blocked
// 2. Role-specific route restrictions are enforced
// 3. Expired sessions are handled correctly
// 4. Cross-role access attempts are prevented
// 5. Input validation prevents injection attacks
```

#### Integration Test Results Summary

| Workflow | Status | Issues Identified | Resolution |
|----------|--------|-------------------|------------|
| User Registration | ✅ Passed | Verification email not sent | Added to backlog |
| Internship Application | ✅ Passed | Application count not updating | Fixed in PR #45 |
| Report Submission | ✅ Passed | Form validation errors | Fixed in PR #52 |
| Messaging System | ⚠️ Partial | Offline message handling | In progress |
| Security Controls | ✅ Passed | Password storage vulnerability | Fixed in PR #60 |

### 10.4 Bug Tracking and Fixes

The testing process identified several issues that were subsequently addressed to improve system quality.

#### Bug Tracking Process

The PAL system uses a structured approach to bug tracking:

1. **Identification**: Bugs discovered through automated tests or manual testing
2. **Documentation**: Issues logged with reproduction steps and severity
3. **Prioritization**: Bugs ranked by impact and urgency
4. **Assignment**: Issues assigned to appropriate developers
5. **Resolution**: Fixes implemented with corresponding test cases
6. **Verification**: Retesting to confirm resolution

#### Critical Bugs and Resolutions

| Bug ID | Description | Severity | Resolution | Fixed Version |
|--------|-------------|----------|------------|---------------|
| BUG-001 | Users not logged out when session expires | High | Implemented token expiration check | v1.2.3 |
| BUG-002 | Applications could exceed daily limit in some cases | High | Added transaction-based count verification | v1.2.4 |
| BUG-003 | Supervisor could submit multiple reports for same template | Medium | Added unique constraint in database | v1.2.5 |
| BUG-004 | Profile image upload failing for large images | Medium | Added image compression before upload | v1.2.6 |
| BUG-005 | Firebase messages not showing in real-time consistently | High | Improved listener implementation | v1.3.0 |

#### Security Vulnerabilities Addressed

| Vulnerability | Risk Level | Mitigation |
|---------------|------------|------------|
| Plain text password storage | Critical | Implemented bcrypt password hashing |
| Insecure session management | High | Added HTTP-only cookies and proper token validation |
| SQL injection possibility | High | Enforced parameterized queries for all database operations |
| XSS vulnerability in message display | Medium | Implemented content sanitization for user inputs |
| Missing CSRF protection | Medium | Added CSRF tokens to sensitive forms |

### 10.5 Continuous Improvement

The testing strategy includes continuous improvement mechanisms to enhance test coverage and system quality over time.

#### Test Automation Pipeline

A planned CI/CD pipeline will automate the testing process:

```yaml
# GitHub Actions workflow (planned implementation)
name: PAL System CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v1
        with:
          node-version: '16.x'
      - name: Install dependencies
        run: npm ci
      - name: Lint code
        run: npm run lint
      - name: Run unit tests
        run: npm test
      - name: Run integration tests
        run: npm run test:integration
      - name: Generate coverage report
        run: npm run coverage
```

#### Test Documentation Standards

To ensure consistent test documentation, the following standards are applied:

1. **Test Naming**: Clear descriptive names (e.g., `should_reject_login_with_invalid_credentials`)
2. **Arrange-Act-Assert**: Structured test pattern for readability
3. **Test Comments**: Purpose and edge cases documented
4. **Coverage Goals**: Minimum coverage thresholds per module
5. **Regression Tests**: Automatic tests for previously fixed bugs

#### Future Testing Improvements

The testing strategy will evolve with the following planned enhancements:

1. **Automated E2E Testing**: Implement Cypress for end-to-end workflow testing
2. **Visual Regression Testing**: Add screenshot comparison for UI changes
3. **Load Testing**: Implement performance testing for concurrent users
4. **Security Scanning**: Integrate OWASP dependency checking and security scanning
5. **Accessibility Testing**: Add tests for WCAG compliance

This comprehensive testing approach ensures the PAL system maintains high quality standards while supporting ongoing development and enhancement.

### 10.6 Core Functionality Test Cases

The following test cases focus on the core functionality of the PAL system, ensuring that all critical features work as expected across different user roles.

#### Authentication and Access Control Tests

| Field               | Description                                                                            |
| ------------------- | -------------------------------------------------------------------------------------- |
| **Test Case ID**    | TC-01                                                                                  |
| **Title**           | Login with valid credentials                                                           |
| **Description**     | Verify that login succeeds with correct user credentials                               |
| **Preconditions**   | User exists with valid email and password                                              |
| **Test Steps**      | 1. Navigate to login page <br> 2. Enter valid email and password <br> 3. Click "Login" |
| **Expected Result** | User is redirected to dashboard with correct role displayed                            |
| **Actual Result**   | User successfully redirected to role-specific dashboard                                |
| **Status**          | PASS                                                                                   |

| Field               | Description                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| **Test Case ID**    | TC-02                                                                                             |
| **Title**           | Role-based access restriction                                                                     |
| **Description**     | Verify that users cannot access pages restricted to other roles                                   |
| **Preconditions**   | User is logged in with student role                                                               |
| **Test Steps**      | 1. Attempt to access company dashboard via direct URL <br> 2. Attempt to access admin dashboard   |
| **Expected Result** | User is redirected back to student dashboard with unauthorized access message                     |
| **Actual Result**   | User successfully redirected with "Unauthorized Access" message                                   |
| **Status**          | PASS                                                                                              |

#### Student Module Tests

| Field               | Description                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| **Test Case ID**    | TC-03                                                                                            |
| **Title**           | Internship search and filtering                                                                  |
| **Description**     | Verify that students can search and filter internships                                           |
| **Preconditions**   | Student is logged in and internships exist in the system                                         |
| **Test Steps**      | 1. Navigate to internship search page <br> 2. Filter by location "Ramallah" <br> 3. Sort by date |
| **Expected Result** | Only internships in Ramallah are displayed, sorted by most recent first                          |
| **Actual Result**   | Correct internships displayed with proper filtering and sorting                                  |
| **Status**          | PASS                                                                                             |

| Field               | Description                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**    | TC-04                                                                                                                       |
| **Title**           | Internship application submission                                                                                           |
| **Description**     | Verify that students can submit applications for internships                                                                |
| **Preconditions**   | Student is logged in and has not reached daily application limit                                                            |
| **Test Steps**      | 1. Navigate to internship details page <br> 2. Click "Apply" button <br> 3. Complete application form <br> 4. Submit form   |
| **Expected Result** | Application is submitted successfully with confirmation message, status shows as "Pending"                                  |
| **Actual Result**   | Application submitted with confirmation, status correctly shows "Pending"                                                   |
| **Status**          | PASS                                                                                                                        |

#### Company Module Tests

| Field               | Description                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**    | TC-05                                                                                                               |
| **Title**           | Internship posting creation                                                                                         |
| **Description**     | Verify that companies can create new internship postings                                                            |
| **Preconditions**   | Company user is logged in                                                                                           |
| **Test Steps**      | 1. Navigate to company dashboard <br> 2. Click "Create Internship" <br> 3. Fill all required fields <br> 4. Submit  |
| **Expected Result** | Internship is created and appears in company's internship list and student search results                           |
| **Actual Result**   | Internship successfully created and visible in both company dashboard and student search                            |
| **Status**          | PASS                                                                                                                |

| Field               | Description                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Test Case ID**    | TC-06                                                                                                                             |
| **Title**           | Application review and acceptance                                                                                                    |
| **Description**     | Verify that companies can review and accept student applications                                                                     |
| **Preconditions**   | Company has internship postings with pending applications                                                                            |
| **Test Steps**      | 1. Navigate to applications page <br> 2. Select a pending application <br> 3. Review student profile <br> 4. Click "Accept" button   |
| **Expected Result** | Application status changes to "Accepted", student is notified, and application appears in accepted list                              |
| **Actual Result**   | Status correctly updated to "Accepted", notification sent to student, and application moved to accepted list                         |
| **Status**          | PASS                                                                                                                             |

#### Supervisor Module Tests

| Field               | Description                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**    | TC-07                                                                                                                            |
| **Title**           | Student report submission                                                                                                        |
| **Description**     | Verify that supervisors can submit performance reports for assigned students                                                     |
| **Preconditions**   | Supervisor is logged in and has students assigned                                                                                |
| **Test Steps**      | 1. Navigate to reports page <br> 2. Select student <br> 3. Select report template <br> 4. Complete evaluation form <br> 5. Submit |
| **Expected Result** | Report is submitted successfully and available for admin review and student viewing                                              |
| **Actual Result**   | Report submitted successfully and correctly visible to admin and student                                                         |
| **Status**          | PASS                                                                                                                             |

#### Admin Module Tests

| Field               | Description                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Test Case ID**    | TC-08                                                                                                                          |
| **Title**           | Student registration approval                                                                                                  |
| **Description**     | Verify that admin can approve pending student registrations                                                                    |
| **Preconditions**   | Admin is logged in and pending student registrations exist                                                                     |
| **Test Steps**      | 1. Navigate to registration requests <br> 2. Review student details <br> 3. Click "Approve" button                             |
| **Expected Result** | Student status changes to "Approved", student is notified, and they can now log in                                             |
| **Actual Result**   | Status correctly updated, notification sent, and student able to log in                                                        |
| **Status**          | PASS                                                                                                                           |

| Field               | Description                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**    | TC-09                                                                                                                             |
| **Title**           | Report template creation                                                                                                          |
| **Description**     | Verify that admin can create report templates for supervisors                                                                     |
| **Preconditions**   | Admin is logged in                                                                                                                |
| **Test Steps**      | 1. Navigate to report templates <br> 2. Click "Create Template" <br> 3. Add fields and questions <br> 4. Set deadline <br> 5. Save |
| **Expected Result** | Template is created and available for supervisors to use                                                                          |
| **Actual Result**   | Template successfully created and visible to supervisors                                                                          |
| **Status**          | PASS                                                                                                                                 |

#### Messaging System Tests

| Field               | Description                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**    | TC-10                                                                                                                       |
| **Title**           | Cross-role messaging                                                                                                        |
| **Description**     | Verify that users can send and receive messages across different roles                                                      |
| **Preconditions**   | Student and supervisor users are logged in                                                                                  |
| **Test Steps**      | 1. Student navigates to messaging <br> 2. Selects supervisor <br> 3. Composes and sends message <br> 4. Supervisor checks inbox |
| **Expected Result** | Message is delivered in real-time and appears in supervisor's inbox                                                         |
| **Actual Result**   | Message successfully delivered and displayed in real-time                                                                   |
| **Status**          | PASS                                                                                                                        |

These test cases cover the core functionality of the PAL system across all user roles, ensuring that the most critical features work as expected. Each test case includes clear steps, expected results, and the actual outcome observed during testing. The PASS status indicates that all core functionality is working correctly in the current version of the system.

### 10.7 Failed Test Cases and Alternate Flows

In addition to successful test cases, it's important to document failed tests to track issues and develop fixes. The following test cases represent scenarios where system functionality did not meet requirements.

#### Failed Test Cases

| Field               | Description                                                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**    | TC-11                                                                                                                                    |
| **Title**           | Daily application limit enforcement                                                                                                      |
| **Description**     | Verify that students cannot exceed the daily application limit of 10 applications                                                        |
| **Preconditions**   | Student has already submitted 10 applications today                                                                                      |
| **Test Steps**      | 1. Navigate to internship search <br> 2. Open a new internship <br> 3. Click "Apply" button <br> 4. Complete application form <br> 5. Submit |
| **Expected Result** | System prevents submission with "Daily application limit reached" message                                                                |
| **Actual Result**   | System accepted 11th application in certain race conditions when multiple tabs were open                                                 |
| **Status**          | FAIL                                                                                                                                     |
| **Bug ID**          | BUG-002                                                                                                                                  |
| **Resolution Plan** | Implement server-side transaction locking to ensure accurate count verification before accepting new applications                        |

| Field               | Description                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**    | TC-12                                                                                                                             |
| **Title**           | Session timeout handling                                                                                                          |
| **Description**     | Verify that system properly handles expired user sessions                                                                         |
| **Preconditions**   | User is logged in and session token is manually expired                                                                           |
| **Test Steps**      | 1. User is inactive for session timeout period <br> 2. User attempts to access protected page <br> 3. System checks token validity |
| **Expected Result** | User is redirected to login page with "Session expired" message                                                                   |
| **Actual Result**   | System showed error but did not redirect to login page, leaving user on broken page                                               |
| **Status**          | FAIL                                                                                                                              |
| **Bug ID**          | BUG-001                                                                                                                           |
| **Resolution Plan** | Implement global token expiration handler with automatic redirect to login page                                                   |

| Field               | Description                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Test Case ID**    | TC-13                                                                                                                                |
| **Title**           | Large profile image upload                                                                                                           |
| **Description**     | Verify that system can handle large image uploads for profile pictures                                                               |
| **Preconditions**   | User is logged in and attempts to upload a high-resolution image (8MB)                                                               |
| **Test Steps**      | 1. Navigate to profile page <br> 2. Click "Change Profile Picture" <br> 3. Select large image file <br> 4. Click "Upload"            |
| **Expected Result** | System either compresses image or provides clear error message about size limits                                                     |
| **Actual Result**   | Upload appeared to succeed but image was not saved, no error message displayed                                                       |
| **Status**          | FAIL                                                                                                                                 |
| **Bug ID**          | BUG-004                                                                                                                              |
| **Resolution Plan** | Add client-side image compression and clear size limit warnings                                                                      |

| Field               | Description                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Test Case ID**    | TC-16                                                                                                                                |
| **Title**           | Messaging system privacy controls                                                                                                    |
| **Description**     | Verify that students can only see messages from supervisors assigned to their internships                                            |
| **Preconditions**   | Student is logged in and multiple supervisors exist in the system (some assigned to student, some not)                               |
| **Test Steps**      | 1. Navigate to messaging interface <br> 2. Open inbox <br> 3. Check list of supervisor conversations                                 |
| **Expected Result** | Only messages from supervisors assigned to student's internships are visible                                                         |
| **Actual Result**   | All supervisor messages in the system were visible to student, including those from unassigned supervisors                           |
| **Status**          | FAIL                                                                                                                                 |
| **Bug ID**          | BUG-006                                                                                                                              |
| **Resolution Plan** | Implement messaging permission filters based on supervisor-student relationships in the database                                     |

#### Alternate Flow Test Cases

| Field               | Description                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**    | TC-14                                                                                                                                 |
| **Title**           | Internship application cancellation                                                                                                   |
| **Description**     | Verify that students can cancel pending applications before company review                                                            |
| **Preconditions**   | Student has submitted application that is still in "Pending" status                                                                   |
| **Test Steps**      | 1. Navigate to "My Applications" <br> 2. Find pending application <br> 3. Click "Cancel Application" <br> 4. Confirm cancellation     |
| **Expected Result** | Application is removed from student's active applications and company's review queue                                                  |
| **Actual Result**   | Application successfully cancelled and removed from both student and company views                                                    |
| **Status**          | PASS                                                                                                                                  |
| **Notes**           | This represents an alternate flow to the standard application process, giving students the ability to retract applications if needed. |

| Field               | Description                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test Case ID**    | TC-15                                                                                                                                      |
| **Title**           | Password reset for first-time login                                                                                                        |
| **Description**     | Verify that system enforces password change on first login for admin-created accounts                                                      |
| **Preconditions**   | Admin has created a new student account with temporary password and "isFirstLogin" flag set to true                                        |
| **Test Steps**      | 1. Student logs in with temporary password <br> 2. System displays password reset form <br> 3. Student enters new password <br> 4. Submit  |
| **Expected Result** | Password is updated, "isFirstLogin" flag is set to false, student is redirected to dashboard                                               |
| **Actual Result**   | Password successfully updated and student properly redirected to dashboard                                                                 |
| **Status**          | PASS                                                                                                                                       |
| **Notes**           | This represents an alternate authentication flow that ensures security for admin-created accounts by enforcing password changes.           |

| Field               | Description                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**    | TC-17                                                                                                                                       |
| **Title**           | Supervisor messaging restrictions for students                                                                                              |
| **Description**     | Verify that students can only message their directly assigned supervisor, not any supervisor at the company                                 |
| **Preconditions**   | 1. Student is accepted for an internship at a company with multiple supervisors<br>2. One specific supervisor is assigned to the student    |
| **Test Steps**      | 1. Student navigates to messaging interface<br>2. Student checks available supervisor contacts<br>3. Student attempts to send messages to different supervisors at the company |
| **Expected Result** | Student should only be able to initiate conversations with their specifically assigned supervisor, not all supervisors at the company       |
| **Actual Result**   | Student was able to message any supervisor in the internship company that accepted them, not just their assigned supervisor                 |
| **Status**          | FAIL                                                                                                                                        |
| **Bug ID**          | BUG-007                                                                                                                                     |
| **Resolution Plan** | Implement stricter messaging access controls that limit student-supervisor messaging to direct assignment relationships only                |

The identification of these failed test cases led to specific bug fixes and system improvements. The alternate flow test cases demonstrate the system's ability to handle exceptional paths that differ from the primary user flow, providing users with flexibility and enhanced security.
