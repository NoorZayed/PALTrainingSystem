import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./assets/components/Navbar/Navbar";
import MainPage from "./assets/components/pages/mainpage";
import Footer from "./assets/components/Navbar/Footer";
import Login from "./assets/components/pages/Login";
import ForgotPassword from "./assets/components/pages/ForgotPassword";
import Contact from "./assets/components/pages/Contact";
import Signup from "./assets/components/pages/Signup";
import StudentProfile from "./assets/components/pages/StudentProfile";
import AboutUs from "./assets/components/pages/AboutUs";
import InternshipSearch from "./assets/components/pages/InternshipSearch";
import StudentDashboard from "./assets/components/pages/StudentDashboard";
import SaveList from "./assets/components/pages/SaveList";
import StudentMessages from "./assets/components/pages/studentMessages";
import Report from "./assets/components/pages/Report";
import StudentRequestPage from "./assets/components/pages/studentRequestPage";
import CompanyDashboard from "./assets/components/pages/CompanyDashboard";
import CompanyInternships from "./assets/components/pages/CompanyInternships";
import CompanyRequests from "./assets/components/pages/CompanyRequests";
import CompanyReports from "./assets/components/pages/CompanyReports";
import CompanyMessages from "./assets/components/pages/CompanyMessages";
import ViewInternship from "./assets/components/pages/ViewInternship";
import EditInternship from "./assets/components/pages/EditInternship";
import AddInternship from "./assets/components/pages/AddInternship";
import ManageSupervisors from "./assets/components/pages/ManageSupervisors";
import CertificationsPage from "./assets/components/pages/CertificationsPage";
import InternshipAdminPage from "./assets/components/pages/InternshipAdminPage";
import ResetPassword from "./assets/components/pages/ResetPassword";
import StudentForm from "./assets/components/pages/StudentForm";
import StudentRequests from "./assets/components/pages/StudentRequests";
import AdminViewStudents from "./assets/components/pages/AdminViewStudents";
import AdminDashboard from "./assets/components/pages/adminDashboard";
import CompanyProfile from "./assets/components/pages/companyProfile";
import Logout from "./assets/components/pages/Logout";
import AdminMessages from "./assets/components/pages/adminMessages";
import AdminProfile from "./assets/components/pages/AdminProfile";
import EditAdminProfile from "./assets/components/pages/EditAdminProfile";
import EditCompanyProfile from "./assets/components/pages/EditCompanyProfile";
import EditStudentProfile from "./assets/components/pages/EditStudentProfile";
import TrainingReportsPage from "./assets/components/pages/TrainingReportsPage";
import SupervisorAside from "./assets/components/Navbar/SupervisorAside";
import SupervisorMessagesPage from "./assets/components/pages/SupervisorMessagesPage";
import SupervisorSetAbsentPage from "./assets/components/pages/SupervisorSetAbsentPage";
import SupervisorReportPage from "./assets/components/pages/SupervisorReportPage";
import SupervisorDashboard from "./assets/components/pages/SupervisorDashboard";
import SupervisorProfilePage from "./assets/components/pages/SupervisorProfilePage";
import InternshipDetails from "./assets/components/pages/InternshipDetails";
import SetPassword from "./assets/components/pages/SetPassword";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        /// public routes
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/aboutus" element={<AboutUs />} />
        /// student routes
        <Route
          path="/student/studentDashboard"
          element={<StudentDashboard />}
        />
        <Route path="/StudentProfile" element={<StudentProfile />} />
        <Route
          path="/student/InternshipSearch"
          element={<InternshipSearch />}
        />
        <Route path="/student/save-list" element={<SaveList />} />
        <Route path="/student/messages" element={<StudentMessages />} />
        <Route path="/student/Report" element={<Report />} />
        <Route path="/student/requests" element={<StudentRequestPage />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
        <Route path="/Student/form" element={<StudentForm />} />
        <Route path="/certifications" element={<CertificationsPage />} />
        <Route
          path="/student/EditStudentProfile"
          element={<EditStudentProfile />}
        />
        <Route path="/internships" element={<InternshipSearch />} />
        More actions
        <Route path="/internship/:id" element={<InternshipDetails />} />
        <Route path="/student-profile/:id" element={<StudentProfile />} />
        ///company ny routes
        <Route path="/company/Profile" element={<CompanyProfile />} />
        <Route
          path="/company/CompanyDashboard"
          element={<CompanyDashboard />}
        />
        <Route path="/company/internships" element={<CompanyInternships />} />
        <Route path="/company/requests" element={<CompanyRequests />} />
        <Route path="/company/reports" element={<CompanyReports />} />
        <Route path="/company/messages" element={<CompanyMessages />} />
        <Route
          path="/company/EditCompanyProfile"
          element={<EditCompanyProfile />}
        />
        <Route
          path="/company/internships/view/:id"
          element={<ViewInternship />}
        />
        <Route
          path="/company/internships/edit/:id"
          element={<EditInternship />}
        />
        <Route path="/company/internships/add" element={<AddInternship />} />
        <Route path="/company/supervisors" element={<ManageSupervisors />} />
        /// admin routes
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route
          path="/admin/InternshipAdminPage"
          element={<InternshipAdminPage />}
        />
        <Route
          path="/admin/AdminViewStudents"
          element={<AdminViewStudents />}
        />
        <Route path="/admin/adminMessages" element={<AdminMessages />} />
        <Route path="/admin/AdminProfile" element={<AdminProfile />} />
        <Route path="/admin/EditAdminProfile" element={<EditAdminProfile />} />
        <Route path="/admin/StudentRequests" element={<StudentRequests />} />
        <Route
          path="/admin/TrainingReportsPage"
          element={<TrainingReportsPage />}
        />
        <Route path="/set-password" element={<SetPassword />} />
        /// supervisor routes
        <Route
          path="/supervisor/messages"
          element={<SupervisorMessagesPage />}
        />
        <Route
          path="/supervisor/set-absent"
          element={<SupervisorSetAbsentPage />}
        />
        <Route path="/supervisor/reports" element={<SupervisorReportPage />} />
        <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
        <Route path="/supervisor/profile" element={<SupervisorProfilePage />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
