# System Model and System Architecture

## 3.1 Product Description

The PalTraining System (PLS) is a platform designed to connect students, training managers, and companies to enhance the internship process and achieve training objectives. PLS helps students find suitable training opportunities that align with their preferences for location, available courses, and the number of open positions. Companies can post their internship opportunities on the platform, providing a brief description of their organization to attract the desired number of students. Training managers can monitor students' progress through feedback from companies regarding their performance and review reports submitted by students throughout the training period for evaluation purposes. PLS facilitates seamless interaction among all users—students, companies, and training managers—via an integrated messaging system for reporting issues and facilitating communication. Additionally, it offers efficient and scalable management of the entire internship process.

## 3.1.1 System Objectives

● To simplify the application and matching process for internships.
● To reduce administrative effort for the training manager.
● To improve communication between all users (student, supervisor, and training manager).
● To provide real-time monitoring and feedback on student performance.

## 3.1.2 System Main Features

### ● Internship Discovery
Assists students in identifying internships that align with their skills and career objectives, providing comprehensive information about companies, locations, available courses, and positions.

### ● Real-Time Tracking
Empowers training managers to monitor student activities, attendance, and performance during internships through feedback from supervisors.

### ● Streamlined Communication
Features a messaging system that facilitates direct communication between students, training managers, and supervisors.

### ● Application Management
Allows companies to post internship opportunities, review student applications, and manage them (accept/reject).

### ● Reports and Alerts
Enables supervisors to submit reports, view them by the student, and receive alerts about deadlines and submissions.

## 3.1.3 Operating Environments

### 1) Client Device:
● **Training Manager Dashboard (UI)**: Administrative interface for system oversight and student management.
● **Company Dashboard (UI)**: Interface for internship posting and application management.
● **Supervisor Dashboard (UI)**: Interface for student monitoring and report evaluation.
● **Student Dashboard (UI)**: Interface for internship search, applications, and progress tracking.
● **Web Browser**: For accessing the platform across all user types.

### 2) Web Server:
The web server hosts the web application and the REST API services that facilitate communication between the client devices and the application server.

### 3) Application Server:
The application server handles and processes requests from the web server.

**Components:**
● **Authentication Service**: User login and session management.
● **Account Management Service**: User registration and profile management.
● **Report Management Service**: Student report submission and evaluation.
● **Application Processing Service**: Internship application handling.
● **Internship Management Service**: Internship posting and matching.
● **Persistence Infrastructure**: For data storage interactions.

### 4) Database Server:
The database server stores and manages all persistent data for the platform.

**Components:**
● **Database (SQL)**: For storing user data, internship details, applications, reports, and system configurations.

## 3.1.4 Constraints

### 1) Technical Constraints:
● **Hardware Limitations**: Platform performance might be affected by server hardware during peak times when many users access the platform simultaneously.
● **Network Constraints**: The platform is dependent on network stability for real-time applications, communication, and tracking.

### 2) Security Constraints:
● **Data Privacy**: The system must comply with data protection regulations to ensure sensitive information provided by users (company, student, and training manager information) is protected.
● **Access Control**: To prevent unauthorized access to the platform, this is ensured by the administrative role of the training manager for accepting registration of student and company requests.

### 3) Performance Constraints:
● **System Load**: High traffic during peak times will slow the system's performance and lead to slower response times.
● **Database Queries**: Growing datasets might slow down the database server performance.

### 4) Usability Constraints:
● **Interface Simplicity**: The need for simple and intuitive interfaces for users might limit the usage of complex or advanced features.

## 3.1.5 Functional Requirements

### 1) Student Features:

#### ● Internship Recommendation:
The system displays recommended internship opportunities according to student's information gathered from the registration form.

#### ● Internship Search:
Students can browse through a catalog of internships posted by companies with filtering and search capabilities.

#### ● Internship Applications:
- Students can apply to a maximum of three internships at a time.
- Students fill in the required form provided by the system before the application process.

#### ● Progress Reporting:
Students can submit training progress reports, which are reviewed by training managers.

#### ● Secure Messaging:
Students can communicate securely with training managers and supervisors through a role-based messaging system.

#### ● Notifications:
Alerts for upcoming deadlines, feedback, and updates on application status.

#### ● Data Management:
Students can track their application status after applying for 3 or fewer company applications.

### 2) Company Features:

#### ● Internship Management:
Companies can post internships, set eligibility criteria, and manage internship details.

#### ● Application Management:
- View applications from students and manage them (accept/reject).
- Provide feedback on student performance during internships.

#### ● Performance Tracking:
Companies can track and report the progress of students interning with them.

#### ● Data Management:
Companies can maintain records of feedback on student performance.

### 3) Training Manager (Admin) Features:

#### ● Account Management:
Manage student accounts, including registration approval, role assignment, account deletion, account creation, and editing training manager's account.

#### ● Application Oversight:
Oversee student internship applications and manage approvals.

#### ● Training Progress Monitoring:
Evaluate training reports submitted by students and track their activities during internships.

#### ● Performance Tracking:
Track students' internship activities, behavior, and overall performance through comprehensive reporting.

## 3.1.6 Non-Functional Requirements

### 1) Scalability:
● Support for multiple users (Student, Company, Training Manager, Supervisor) concurrently accessing the platform.

### 2) Performance:
● Quick response times for API calls and database queries.
● Real-time updates for tracking and notifications.

### 3) Security:
● Basic authentication and role-based access control.
● Protection of sensitive data (e.g., personal information and reports).

### 4) Usability:
● The interface should be user-friendly and accessible.
● Intuitive user interface to ensure ease of navigation.

### 5) Accessibility:
● Cross-platform compatibility (web-based).
● Responsive design for various screen sizes and devices.

## Architecture Summary

The PAL Training System implements a modern web-based architecture that effectively serves all stakeholders in the internship process. The system's design prioritizes user experience, scalability, and maintainability while providing comprehensive functionality for internship management, student tracking, and administrative oversight.
